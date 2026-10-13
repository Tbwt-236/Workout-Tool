import { test, expect } from '@jest/globals';
import { createSqliteWorkoutRepository } from '../../src/features/workouts/data/sqlite-workout-repository';
import { sqliteFixture, deferred } from '../support/sqlite';

const draft = { startedAt: '2026-10-12T01:00:00.000Z', exercises: [
  { localKey: 'e', name: '深蹲 "A" \\', position: 0, sets: [
    { localKey: 's', position: 0, reps: 8, weightTenthsKg: null },
    { localKey: 's2', position: 1, reps: 10, weightTenthsKg: 625 },
  ] }, { localKey: 'empty', name: '未录组动作', position: 1, sets: [] },
] };
const completedAt = '2026-10-12T01:30:00.000Z';

test('全量快照从同一次SQL读取有序完整聚合，保留空重量和无组动作', async () => {
  const f = sqliteFixture();
  try {
    const repo = createSqliteWorkoutRepository(async () => f.open().connection);
    expect(repo).toHaveProperty('readExportSnapshot', expect.any(Function));
    expect(await repo.readExportSnapshot()).toMatchObject({ ok: true, snapshot: { workouts: [] } });
    await repo.saveCompletedWorkout(draft, completedAt); await repo.saveCompletedWorkout(draft, completedAt);
    const result = await repo.readExportSnapshot();
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected snapshot');
    expect(result.snapshot.workouts.map(w => w.id)).toEqual([2, 1]);
    expect(result.snapshot.workouts[0]).toMatchObject({ durationSeconds: 1800, exerciseCount: 2, setCount: 2,
      exercises: [{ name: '深蹲 "A" \\', position: 0, sets: [{ position: 0, reps: 8, weightTenthsKg: null },
        { position: 1, reps: 10, weightTenthsKg: 625 }] }, { name: '未录组动作', position: 1, sets: [] }] });
    expect(new Date(result.snapshot.snapshotAt).toISOString()).toBe(result.snapshot.snapshotAt);
  } finally { f.dispose(); }
});

test('快照读取期间保存和删除互斥，返回后释放锁；原快照不随删除改变', async () => {
  const f = sqliteFixture(), gate = deferred(), started = deferred(); let hold = false;
  try {
    const repo = createSqliteWorkoutRepository(async () => {
      const { connection } = f.open();
      return { ...connection, async getAllAsync<T>(sql: string, params: (number | string | null)[] = []) {
        const rows = await connection.getAllAsync<T>(sql, params);
        if (hold) { started.resolve(); await gate.promise; }
        return rows;
      } };
    });
    expect(repo).toHaveProperty('readExportSnapshot', expect.any(Function));
    await repo.saveCompletedWorkout(draft, completedAt); hold = true;
    const pending = repo.readExportSnapshot(); await started.promise;
    expect(await repo.saveCompletedWorkout(draft, completedAt)).toEqual({ ok: false, code: 'Busy' });
    expect(await repo.deleteCompletedWorkout(1, true)).toEqual({ ok: false, code: 'Busy' });
    hold = false; gate.resolve(); const snapshot = await pending;
    expect(await repo.deleteCompletedWorkout(1, true)).toEqual({ ok: true });
    expect(snapshot.ok && snapshot.snapshot.workouts).toHaveLength(1);
    expect(await repo.readExportSnapshot()).toMatchObject({ ok: true, snapshot: { workouts: [] } });
  } finally { gate.resolve(); f.dispose(); }
});

test('任一存储聚合损坏时全量失败，不能静默漏掉坏训练', async () => {
  const f = sqliteFixture(); const { raw, connection } = f.open();
  try {
    const repo = createSqliteWorkoutRepository(async () => connection);
    expect(repo).toHaveProperty('readExportSnapshot', expect.any(Function));
    await repo.saveCompletedWorkout(draft, completedAt); await repo.saveCompletedWorkout(draft, completedAt);
    raw.exec('PRAGMA ignore_check_constraints = ON; UPDATE sets SET reps=0 WHERE id=1');
    expect(await repo.readExportSnapshot()).toEqual({ ok: false, code: 'UnexpectedStorageError' });
  } finally { f.dispose(); }
});
