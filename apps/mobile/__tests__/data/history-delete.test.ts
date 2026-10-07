/** @jest-environment node */
import { test, afterEach } from '@jest/globals';
import assert from 'node:assert/strict';
import { sqliteFixture, deferred } from '../support/sqlite';
import { createSqliteWorkoutRepository } from '../../src/features/workouts/data/sqlite-workout-repository';
const fixtures: ReturnType<typeof sqliteFixture>[] = [];
afterEach(() => { for (const f of fixtures.splice(0)) f.dispose(); });
const draft = { startedAt: '2026-09-23T00:00:00.000Z', exercises: [
  { localKey: 'e', name: '深蹲', position: 0, sets: [
    { localKey: 'a', position: 0, reps: 8, weightTenthsKg: 625 },
    { localKey: 'b', position: 1, reps: 10, weightTenthsKg: null }] },
  { localKey: 'empty', name: '划船', position: 1, sets: [] }] };
const completedAt = '2026-09-23T01:00:00.000Z';
async function seeded() {
  const f = sqliteFixture(); fixtures.push(f);
  const writer = f.open();
  let opens = 0;
  const repository = createSqliteWorkoutRepository(async () => ++opens === 1 ? writer.connection : f.open().connection);
  assert.ok((await repository.saveCompletedWorkout(draft, completedAt)).ok);
  assert.ok((await repository.saveCompletedWorkout(draft, completedAt)).ok);
  return { ...f, ...writer, repository };
}

test('未确认及非法ID不打开数据库，确认必须严格为true', async () => {
  let opens = 0;
  const repository = createSqliteWorkoutRepository(async () => { opens++; throw new Error('should not open'); });
  assert.equal(typeof repository.deleteCompletedWorkout, 'function');
  for (const confirmed of [false, undefined, 'yes']) {
    assert.deepEqual(await repository.deleteCompletedWorkout(1, confirmed as boolean), { ok: false, code: 'NotConfirmed' });
  }
  for (const id of [0, -1, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1, '1 OR 1=1']) {
    assert.deepEqual(await repository.deleteCompletedWorkout(id as number, true), { ok: false, code: 'NotFound' });
  }
  assert.equal(opens, 0);
});
test('确认只级联删除选定训练及动作组，另一场与其顺序不变，文件重开仍已删除', async () => {
  const h = await seeded();
  const kept = await h.repository.getCompletedWorkout(2);
  assert.deepEqual(await h.repository.deleteCompletedWorkout(1, true), { ok: true });
  assert.deepEqual(await h.repository.getCompletedWorkout(1), { ok: false, code: 'NotFound' });
  assert.deepEqual(await h.repository.getCompletedWorkout(2), kept);
  const observer = h.open();
  assert.equal(observer.raw.prepare('SELECT COUNT(*) n FROM workouts').get()?.n, 1);
  assert.equal(observer.raw.prepare('SELECT COUNT(*) n FROM exercises').get()?.n, 2);
  assert.equal(observer.raw.prepare('SELECT COUNT(*) n FROM sets').get()?.n, 2);
  await h.connection.closeAsync();
  const reopened = createSqliteWorkoutRepository(async () => h.open().connection);
  assert.deepEqual(await reopened.getCompletedWorkout(1), { ok: false, code: 'NotFound' });
  const list = await reopened.listCompletedWorkouts();
  assert.ok(list.ok); assert.deepEqual(list.workouts.map(w => w.id), [2]);
});
test('未知或已删除ID返回NotFound，不能扩大删除范围', async () => {
  const h = await seeded();
  assert.deepEqual(await h.repository.deleteCompletedWorkout(999, true), { ok: false, code: 'NotFound' });
  assert.deepEqual(await h.repository.deleteCompletedWorkout(2, true), { ok: true });
  assert.deepEqual(await h.repository.deleteCompletedWorkout(2, true), { ok: false, code: 'NotFound' });
  const list = await h.repository.listCompletedWorkouts();
  assert.ok(list.ok); assert.deepEqual(list.workouts.map(w => w.id), [1]);
});
test('级联中途SQL失败整笔回滚，安全错误不泄漏细节，重新打开后可重试', async () => {
  const h = await seeded(), observer = h.open();
  const before = await h.repository.getCompletedWorkout(1);
  h.raw.exec("CREATE TRIGGER fail_delete BEFORE DELETE ON sets WHEN OLD.position=1 BEGIN SELECT RAISE(ABORT, '/private/synthetic'); END");
  assert.deepEqual(await h.repository.deleteCompletedWorkout(1, true), { ok: false, code: 'UnexpectedStorageError' });
  assert.equal(observer.raw.prepare('SELECT COUNT(*) n FROM workouts').get()?.n, 2);
  assert.equal(observer.raw.prepare('SELECT COUNT(*) n FROM exercises').get()?.n, 4);
  assert.equal(observer.raw.prepare('SELECT COUNT(*) n FROM sets').get()?.n, 4);
  assert.deepEqual(await h.repository.getCompletedWorkout(1), before);
  observer.raw.exec('DROP TRIGGER fail_delete');
  assert.deepEqual(await h.repository.deleteCompletedWorkout(1, true), { ok: true });
});
test('真实延迟外键导致删除COMMIT失败时，父子记录均保留', async () => {
  const h = await seeded(), observer = h.open();
  h.raw.exec(`CREATE TABLE delete_guard(id INTEGER REFERENCES workouts(id) DEFERRABLE INITIALLY DEFERRED);
    CREATE TRIGGER fail_commit AFTER DELETE ON workouts BEGIN INSERT INTO delete_guard VALUES (OLD.id); END;`);
  assert.deepEqual(await h.repository.deleteCompletedWorkout(1, true), { ok: false, code: 'UnexpectedStorageError' });
  assert.equal(observer.raw.prepare('SELECT COUNT(*) n FROM workouts').get()?.n, 2);
  assert.equal(observer.raw.prepare('SELECT COUNT(*) n FROM sets').get()?.n, 4);
  assert.equal(observer.raw.prepare('SELECT COUNT(*) n FROM delete_guard').get()?.n, 0);
});
test('提交前不报告删除成功；并发删读存被拒绝，外部连接仍看见原记录', async () => {
  const h = await seeded(), observer = h.open();
  const entered = deferred(), release = deferred();
  const exec = h.connection.execAsync.bind(h.connection);
  h.connection.execAsync = async sql => {
    if (sql === 'COMMIT') { entered.resolve(); await release.promise; }
    await exec(sql);
  };
  let settled = false;
  const deleting = h.repository.deleteCompletedWorkout(1, true).then(result => { settled = true; return result; });
  try {
    await entered.promise;
    assert.equal(settled, false);
    assert.deepEqual(await h.repository.deleteCompletedWorkout(2, true), { ok: false, code: 'Busy' });
    assert.deepEqual(await h.repository.listCompletedWorkouts(), { ok: false, code: 'Busy' });
    assert.deepEqual(await h.repository.getCompletedWorkout(1), { ok: false, code: 'Busy' });
    assert.deepEqual(await h.repository.saveCompletedWorkout(draft, completedAt), { ok: false, code: 'Busy' });
    assert.equal(observer.raw.prepare('SELECT COUNT(*) n FROM workouts').get()?.n, 2);
  } finally { release.resolve(); }
  assert.deepEqual(await deleting, { ok: true });
  assert.equal(observer.raw.prepare('SELECT COUNT(*) n FROM workouts').get()?.n, 1);
});
test('删除打开失败可重试，不将存储异常冒充已删除', async () => {
  const f = sqliteFixture(); fixtures.push(f);
  let fail = true;
  const repository = createSqliteWorkoutRepository(async () => {
    if (fail) throw new Error('synthetic open');
    return f.open().connection;
  });
  assert.deepEqual(await repository.deleteCompletedWorkout(1, true), { ok: false, code: 'StorageUnavailable' });
  fail = false;
  assert.ok((await repository.saveCompletedWorkout(draft, completedAt)).ok);
  assert.deepEqual(await repository.deleteCompletedWorkout(1, true), { ok: true });
});
