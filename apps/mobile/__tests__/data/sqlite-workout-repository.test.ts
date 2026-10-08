/** @jest-environment node */
import { afterEach, test } from '@jest/globals';
import assert from 'node:assert/strict';
import { createSqliteWorkoutRepository } from '../../src/features/workouts/data/sqlite-workout-repository.ts';
import type { SqliteConnection } from '../../src/features/workouts/data/sqlite-connection.ts';
import type { WorkoutDraft } from '../../src/features/workouts/domain/types.ts';
import { deferred, sqliteFixture } from '../support/sqlite.ts';
import { createWorkoutService } from '../../src/features/workouts/application/workout-service.ts';
import { workoutReducer } from '../../src/features/workouts/application/workout-reducer.ts';
import type { WorkoutState } from '../../src/features/workouts/application/workout-reducer.ts';

const startedAt = '2026-09-17T01:00:00.000Z';
const completedAt = '2026-09-17T01:30:00.999Z';
function draft(): WorkoutDraft {
  return { startedAt, exercises: [
    { localKey: 'squat', name: ' 深蹲 Squat ', position: 0, sets: [
      { localKey: 's1', position: 0, reps: 8, weightTenthsKg: 625 },
      { localKey: 's2', position: 1, reps: 10, weightTenthsKg: null },
    ] },
    { localKey: 'empty', name: '暂未做', position: 1, sets: [] },
    { localKey: 'row', name: "划船'); DROP TABLE workouts;--", position: 2,
      sets: [{ localKey: 'r1', position: 0, reps: 12, weightTenthsKg: 200 }] },
  ] };
}

const fixtures: ReturnType<typeof sqliteFixture>[] = [];
function fixture() { const f = sqliteFixture(); fixtures.push(f); return f; }
afterEach(() => { for (const f of fixtures.splice(0)) f.dispose(); });
async function ready() {
  const f = fixture();
  const current = f.open();
  const repository = createSqliteWorkoutRepository(async () => current.connection);
  assert.deepEqual(await repository.initialize(), { ok: true });
  return { ...f, ...current, repository };
}

test('初始化并发复用一个连接，打开失败仅返回安全错误且允许重试', async () => {
  const f = fixture();
  let opens = 0;
  const repository = createSqliteWorkoutRepository(async () => {
    if (++opens === 1) throw new Error('SQL /synthetic/private/file');
    return f.open().connection;
  });
  assert.deepEqual(await repository.initialize(), { ok: false, code: 'StorageUnavailable' });
  const results = await Promise.all([repository.initialize(), repository.initialize(), repository.initialize()]);
  assert.ok(results.every(result => result.ok));
  assert.equal(opens, 2);
});

test('迁移失败不开放保存，移除不兼容表后可用新连接重试', async () => {
  const f = fixture();
  const observer = f.open();
  observer.raw.exec('CREATE TABLE exercises(legacy_value TEXT)');
  const repository = createSqliteWorkoutRepository(async () => f.open().connection);
  assert.deepEqual(await repository.initialize(), { ok: false, code: 'StorageUnavailable' });
  assert.deepEqual(await repository.saveCompletedWorkout(draft(), completedAt), { ok: false, code: 'StorageUnavailable' });
  assert.equal(observer.raw.prepare('PRAGMA user_version').get()?.user_version, 0);
  observer.raw.exec('DROP TABLE exercises');
  assert.deepEqual(await repository.initialize(), { ok: true });
});

test('整场保存并按位置读回，参数化名称、空动作、整数重量与 null 均保持正确', async () => {
  const h = await ready();
  const input = draft();
  const saved = await h.repository.saveCompletedWorkout(input, completedAt);
  assert.ok(saved.ok);
  assert.equal(saved.workoutId, 1);
  const result = await h.repository.getCompletedWorkout(saved.workoutId);
  assert.deepEqual(result, { ok: true, workout: {
    id: 1, startedAt, completedAt, durationSeconds: 1800, exerciseCount: 3, setCount: 3,
    exercises: [
      { id: 1, name: '深蹲 Squat', position: 0, sets: [
        { id: 1, position: 0, reps: 8, weightTenthsKg: 625 },
        { id: 2, position: 1, reps: 10, weightTenthsKg: null },
      ] },
      { id: 2, name: '暂未做', position: 1, sets: [] },
      { id: 3, name: "划船'); DROP TABLE workouts;--", position: 2,
        sets: [{ id: 3, position: 0, reps: 12, weightTenthsKg: 200 }] },
    ],
  } });
  assert.deepEqual(input, draft());
  assert.equal(h.raw.prepare('SELECT COUNT(*) AS n FROM workouts').get()?.n, 1);
});

test('已提交数据关闭连接后可从同一文件重新读取，时钟回拨时长为零', async () => {
  const h = await ready();
  const saved = await h.repository.saveCompletedWorkout(draft(), '2026-09-17T00:59:00.000Z');
  assert.ok(saved.ok);
  await h.connection.closeAsync();
  const reopened = createSqliteWorkoutRepository(async () => h.open().connection);
  const result = await reopened.getCompletedWorkout(saved.workoutId);
  assert.ok(result.ok);
  assert.equal(result.workout.durationSeconds, 0);
  assert.equal(result.workout.exercises[0].sets[0].weightTenthsKg, 625);
});

test('整个聚合和完成时间在打开数据库前重验证，拒绝绕过表单的无效输入', async () => {
  let opens = 0;
  const repository = createSqliteWorkoutRepository(async () => { opens++; throw new Error('must not open'); });
  const invalid = draft();
  (invalid.exercises[0].sets[0] as { reps: number }).reps = 0;
  assert.deepEqual(await repository.saveCompletedWorkout(invalid, completedAt), {
    ok: false, code: 'ValidationError', field: 'exercises.0.sets.0.reps', reason: 'InvalidReps',
  });
  assert.deepEqual(await repository.saveCompletedWorkout(draft(), '2026-02-30T00:00:00.000Z'), {
    ok: false, code: 'ValidationError', field: 'completedAt', reason: 'InvalidCompletedAt',
  });
  assert.deepEqual(await repository.saveCompletedWorkout({ startedAt, exercises: [] }, completedAt), {
    ok: false, code: 'ValidationError', field: 'exercises', reason: 'EmptyWorkout',
  });
  assert.equal(opens, 0);
});

test('调用后立即修改原对象不影响等待初始化中的保存快照', async () => {
  const f = fixture();
  const gate = deferred();
  const repository = createSqliteWorkoutRepository(async () => { await gate.promise; return f.open().connection; });
  const input = draft();
  const saving = repository.saveCompletedWorkout(input, completedAt);
  (input.exercises[0].sets[0] as { reps: number }).reps = 99;
  gate.resolve();
  const saved = await saving;
  assert.ok(saved.ok);
  const read = await repository.getCompletedWorkout(saved.workoutId);
  assert.ok(read.ok);
  assert.equal(read.workout.exercises[0].sets[0].reps, 8);
});

test('第二组触发 SQL ABORT 时整笔回滚，不影响此前训练，重试只新增一场', async () => {
  const f = fixture();
  const observer = f.open();
  const repository = createSqliteWorkoutRepository(async () => f.open().connection);
  assert.ok((await repository.saveCompletedWorkout(draft(), completedAt)).ok);
  observer.raw.exec("CREATE TRIGGER fail_set BEFORE INSERT ON sets WHEN NEW.position=1 BEGIN SELECT RAISE(ABORT, 'synthetic write failure'); END");
  assert.deepEqual(await repository.saveCompletedWorkout(draft(), completedAt), { ok: false, code: 'UnexpectedStorageError' });
  for (const [table, count] of [['workouts', 1], ['exercises', 3], ['sets', 3]] as const) {
    assert.equal(observer.raw.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get()?.n, count);
  }
  observer.raw.exec('DROP TRIGGER fail_set');
  assert.ok((await repository.saveCompletedWorkout(draft(), completedAt)).ok);
  assert.equal(observer.raw.prepare('SELECT COUNT(*) AS n FROM workouts').get()?.n, 2);
});

test('真实延迟外键使 COMMIT 失败时也回滚，不能返回未提交的 ID', async () => {
  const h = await ready();
  h.raw.exec(`CREATE TABLE commit_guard(id INTEGER REFERENCES workouts(id) DEFERRABLE INITIALLY DEFERRED);
    CREATE TRIGGER fail_commit AFTER INSERT ON workouts BEGIN INSERT INTO commit_guard VALUES (-1); END;`);
  const observer = h.open();
  assert.deepEqual(await h.repository.saveCompletedWorkout(draft(), completedAt), { ok: false, code: 'UnexpectedStorageError' });
  assert.equal(observer.raw.prepare('SELECT COUNT(*) AS n FROM workouts').get()?.n, 0);
  assert.equal(observer.raw.prepare('SELECT COUNT(*) AS n FROM sets').get()?.n, 0);
  assert.equal(observer.raw.prepare('SELECT COUNT(*) AS n FROM commit_guard').get()?.n, 0);
});

test('COMMIT 前不返回成功且外部连接不可见，并发保存和读取返回 Busy', async () => {
  const h = await ready();
  const entered = deferred();
  const release = deferred();
  const exec = h.connection.execAsync.bind(h.connection);
  h.connection.execAsync = async sql => {
    if (sql === 'COMMIT') { entered.resolve(); await release.promise; }
    await exec(sql);
  };
  let settled = false;
  const first = h.repository.saveCompletedWorkout(draft(), completedAt).then(result => { settled = true; return result; });
  try {
    await entered.promise;
    assert.equal(settled, false);
    assert.deepEqual(await h.repository.saveCompletedWorkout(draft(), completedAt), { ok: false, code: 'Busy' });
    assert.deepEqual(await h.repository.getCompletedWorkout(1), { ok: false, code: 'Busy' });
    assert.equal(h.open().raw.prepare('SELECT COUNT(*) AS n FROM workouts').get()?.n, 0);
  } finally { release.resolve(); }
  assert.deepEqual(await first, { ok: true, workoutId: 1 });
  assert.equal(h.raw.prepare('SELECT COUNT(*) AS n FROM workouts').get()?.n, 1);
});

test('另一连接占用写锁时失败无半条数据，锁释放后可重试', async () => {
  const f = fixture();
  const repository = createSqliteWorkoutRepository(async () => f.open().connection);
  assert.ok((await repository.initialize()).ok);
  const blocker = f.open();
  blocker.raw.exec('BEGIN IMMEDIATE');
  try {
    const result = await repository.saveCompletedWorkout(draft(), completedAt);
    assert.equal(result.ok, false);
    assert.equal(blocker.raw.prepare('SELECT COUNT(*) AS n FROM workouts').get()?.n, 0);
  } finally { blocker.raw.exec('ROLLBACK'); }
  assert.deepEqual(await repository.saveCompletedWorkout(draft(), completedAt), { ok: true, workoutId: 1 });
});

test('未知、非整数及注入式 ID 返回 NotFound，不把输入拼接进 SQL', async () => {
  const h = await ready();
  assert.ok((await h.repository.saveCompletedWorkout(draft(), completedAt)).ok);
  for (const id of [99, 0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '1 OR 1=1' as unknown as number]) {
    assert.deepEqual(await h.repository.getCompletedWorkout(id), { ok: false, code: 'NotFound' });
  }
  assert.ok((await h.repository.getCompletedWorkout(1)).ok);
});

test('损坏的已存数据和实际读取异常返回安全错误，不向界面输出 SQL', async () => {
  const h = await ready();
  assert.ok((await h.repository.saveCompletedWorkout(draft(), completedAt)).ok);
  h.raw.exec("UPDATE workouts SET completed_at='not-a-date' WHERE id=1");
  assert.deepEqual(await h.repository.getCompletedWorkout(1), { ok: false, code: 'UnexpectedStorageError' });
  const next = createSqliteWorkoutRepository(async () => h.open().connection);
  assert.ok((await next.initialize()).ok);
  const disruptor = h.open();
  disruptor.raw.exec('DROP TABLE sets');
  assert.deepEqual(await next.getCompletedWorkout(1), { ok: false, code: 'UnexpectedStorageError' });
});

test('回滚报错的连接被关闭且不复用，安全重试不会提交失败那次的残留写入', async () => {
  const f = fixture();
  const observer = f.open();
  let opens = 0;
  const repository = createSqliteWorkoutRepository(async () => {
    const { connection } = f.open();
    if (++opens === 1) {
      const exec = connection.execAsync.bind(connection);
      connection.execAsync = async sql => {
        if (sql === 'ROLLBACK') throw new Error('synthetic rollback I/O failure');
        await exec(sql);
      };
    }
    return connection;
  });
  assert.ok((await repository.initialize()).ok);
  observer.raw.exec("CREATE TRIGGER fail_set BEFORE INSERT ON sets WHEN NEW.position=1 BEGIN SELECT RAISE(ABORT, 'synthetic write failure'); END");
  assert.deepEqual(await repository.saveCompletedWorkout(draft(), completedAt), { ok: false, code: 'UnexpectedStorageError' });
  assert.equal(observer.raw.prepare('SELECT COUNT(*) AS n FROM workouts').get()?.n, 0);
  observer.raw.exec('DROP TRIGGER fail_set');
  assert.deepEqual(await repository.saveCompletedWorkout(draft(), completedAt), { ok: true, workoutId: 1 });
  assert.equal(opens, 2);
});

test('成功提交后不运行可能抛错的清理，不把成功伪装成可重试失败', async () => {
  const h = await ready();
  h.connection.closeAsync = async () => { throw new Error('synthetic close failure'); };
  assert.deepEqual(await h.repository.saveCompletedWorkout(draft(), completedAt), { ok: true, workoutId: 1 });
  assert.equal(h.raw.prepare('SELECT COUNT(*) AS n FROM workouts').get()?.n, 1);
});

test('详情按 position 排列，不依赖自增 ID 或插入顺序', async () => {
  const h = await ready();
  assert.ok((await h.repository.saveCompletedWorkout(draft(), completedAt)).ok);
  h.raw.exec(`UPDATE exercises SET position=3 WHERE id=1;
    UPDATE exercises SET position=0 WHERE id=3;
    UPDATE exercises SET position=2 WHERE id=1;
    UPDATE sets SET position=2 WHERE id=1;
    UPDATE sets SET position=0 WHERE id=2;
    UPDATE sets SET position=1 WHERE id=1;`);
  const result = await h.repository.getCompletedWorkout(1);
  assert.ok(result.ok);
  assert.deepEqual(result.workout.exercises.map(exercise => exercise.id), [3, 2, 1]);
  assert.deepEqual(result.workout.exercises[2].sets.map(set => set.reps), [10, 8]);
});

test('失败连接若连关闭也失败则隔离，后续重试不复用可疑连接或偷偷打开新连接', async () => {
  const f = fixture();
  const current = f.open();
  let opens = 0;
  const repository = createSqliteWorkoutRepository(async () => { opens++; return current.connection; });
  assert.ok((await repository.initialize()).ok);
  const exec = current.connection.execAsync.bind(current.connection);
  current.connection.execAsync = async sql => {
    if (sql === 'ROLLBACK') throw new Error('synthetic rollback failure');
    await exec(sql);
  };
  current.connection.closeAsync = async () => { throw new Error('synthetic close failure'); };
  current.raw.exec("CREATE TRIGGER fail_set BEFORE INSERT ON sets BEGIN SELECT RAISE(ABORT, 'synthetic write failure'); END");
  assert.deepEqual(await repository.saveCompletedWorkout(draft(), completedAt), { ok: false, code: 'UnexpectedStorageError' });
  assert.deepEqual(await repository.saveCompletedWorkout(draft(), completedAt), { ok: false, code: 'StorageUnavailable' });
  assert.deepEqual(await repository.getCompletedWorkout(1), { ok: false, code: 'StorageUnavailable' });
  assert.equal(opens, 1);
  assert.equal(f.open().raw.prepare('SELECT COUNT(*) AS n FROM workouts').get()?.n, 0);
});

test('真实 reducer → service → SQLite：失败保留原草稿，再确认成功才清空并读到唯一摘要', async () => {
  const f = fixture();
  const repository = createSqliteWorkoutRepository(async () => f.open().connection);
  assert.ok((await repository.initialize()).ok);
  const observer = f.open();
  observer.raw.exec("CREATE TRIGGER fail_set BEFORE INSERT ON sets WHEN NEW.position=1 BEGIN SELECT RAISE(ABORT, 'synthetic write failure'); END");
  const input = draft();
  let state: WorkoutState = { status: 'active', draft: input, confirmation: null, feedback: null };
  let attempts = 0;
  const service = createWorkoutService({ repository, now: () => completedAt,
    newAttemptId: () => `sql-attempt-${++attempts}`, state: {
      getState: () => state,
      transition(action) { state = workoutReducer(state, action); return state; },
    } });
  service.requestCompletion();
  assert.deepEqual(await service.completeWorkout(true), { ok: false, code: 'UnexpectedStorageError' });
  assert.equal(state.status, 'error');
  assert.ok('draft' in state);
  assert.equal(state.draft, input);
  assert.equal(observer.raw.prepare('SELECT COUNT(*) AS n FROM workouts').get()?.n, 0);
  observer.raw.exec('DROP TRIGGER fail_set');
  assert.deepEqual(await service.completeWorkout(true), { ok: false, code: 'NotConfirmed' });
  service.requestCompletion();
  assert.deepEqual(await service.completeWorkout(true), { ok: true, workoutId: 1 });
  assert.deepEqual(state, { status: 'completed', workoutId: 1, feedback: null });
  const detail = await repository.getCompletedWorkout(1);
  assert.ok(detail.ok);
  assert.equal(detail.workout.setCount, 3);
  assert.deepEqual(await service.completeWorkout(true), { ok: false, code: 'NoActiveWorkout' });
  assert.equal(observer.raw.prepare('SELECT COUNT(*) AS n FROM workouts').get()?.n, 1);
});

test('关闭失败连接期间初始化必须等待，关闭失败后不提前打开第二连接或误报 ready', async () => {
  const f = fixture();
  const enteredClose = deferred();
  const releaseClose = deferred();
  const current = f.open();
  let opens = 0;
  const repository = createSqliteWorkoutRepository(async () => {
    return ++opens === 1 ? current.connection : f.open().connection;
  });
  assert.ok((await repository.initialize()).ok);
  current.raw.exec("CREATE TRIGGER fail_set BEFORE INSERT ON sets BEGIN SELECT RAISE(ABORT, 'synthetic write failure'); END");
  current.connection.closeAsync = async () => {
    enteredClose.resolve();
    await releaseClose.promise;
    throw new Error('synthetic close failure');
  };
  const failedSave = repository.saveCompletedWorkout(draft(), completedAt);
  await enteredClose.promise;
  const initializing = repository.initialize();
  // Flush promises from the real SQLite driver while keeping close unresolved.
  await new Promise<void>(resolve => setImmediate(resolve));
  const opensWhileClosing = opens;
  releaseClose.resolve();
  assert.deepEqual(await failedSave, { ok: false, code: 'UnexpectedStorageError' });
  const result = await initializing;
  assert.equal(opensWhileClosing, 1);
  assert.deepEqual(result, { ok: false, code: 'StorageUnavailable' });
  assert.equal(opens, 1);
});

// Structural compatibility is checked against Expo's real types during typecheck.
type ExpoConnection = import('expo-sqlite').SQLiteDatabase;
const acceptsExpoConnection = (db: ExpoConnection): SqliteConnection => db;
void acceptsExpoConnection;
