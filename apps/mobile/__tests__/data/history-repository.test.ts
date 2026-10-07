/** @jest-environment node */
import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { sqliteFixture } from '../support/sqlite';
import { createSqliteWorkoutRepository } from '../../src/features/workouts/data/sqlite-workout-repository';

test('真实历史列表初始为空，按完成时间和ID稳定倒序，汇总不受多表连接乘积影响', async () => {
  const f = sqliteFixture();
  try {
    const repository = createSqliteWorkoutRepository(async () => f.open().connection);
    assert.deepEqual(await repository.listCompletedWorkouts(), { ok: true, workouts: [] });
    const draft = { startedAt: '2026-09-23T00:00:00.000Z', exercises: [
      { localKey: 'e', name: 'Squat', position: 0, sets: [
        { localKey: 'a', position: 0, reps: 8, weightTenthsKg: 625 },
        { localKey: 'b', position: 1, reps: 10, weightTenthsKg: null }] },
      { localKey: 'empty', name: 'Row', position: 1, sets: [] }] };
    for (const time of ['2026-09-23T01:00:00.000Z', '2026-09-23T00:30:00.000Z', '2026-09-23T01:00:00.000Z']) {
      assert.ok((await repository.saveCompletedWorkout(draft, time)).ok);
    }
    const result = await repository.listCompletedWorkouts();
    assert.ok(result.ok);
    assert.deepEqual(result.workouts.map(w => [w.id, w.durationSeconds, w.exerciseCount, w.setCount]),
      [[3, 3600, 2, 2], [1, 3600, 2, 2], [2, 1800, 2, 2]]);
  } finally { f.dispose(); }
});
test('历史读取失败不冒充空历史，不泄漏SQL；重试可恢复', async () => {
  const f = sqliteFixture();
  let fail = true;
  try {
    const repository = createSqliteWorkoutRepository(async () => {
      if (fail) throw new Error('/private/synthetic');
      return f.open().connection;
    });
    assert.deepEqual(await repository.listCompletedWorkouts(), { ok: false, code: 'StorageUnavailable' });
    fail = false;
    assert.deepEqual(await repository.listCompletedWorkouts(), { ok: true, workouts: [] });
  } finally { f.dispose(); }
});
