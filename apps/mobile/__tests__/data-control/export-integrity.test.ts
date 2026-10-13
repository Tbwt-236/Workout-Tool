import { test, expect } from '@jest/globals';
import { createSqliteWorkoutRepository } from '../../src/features/workouts/data/sqlite-workout-repository';
import { encodeExportDocument } from '../../src/features/data-control/domain/export-document';
import { sqliteFixture, deferred } from '../support/sqlite';
test('1000场/4000动作/20000组真实SQLite导出逐字段完整，不含内部标识', async () => {
  const f = sqliteFixture(), repo = createSqliteWorkoutRepository(async () => f.open().connection);
  const expected = [];
  try {
    for (let i = 0; i < 1000; i++) {
      const startedAt = new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString();
      const completedAt = new Date(Date.UTC(2026, 0, 1, 0, i + 30)).toISOString();
      const exercises = Array.from({ length: 4 }, (_, e) => ({ name: `合成 ${i}-${e} "深蹲"`, position: e,
        sets: Array.from({ length: 5 }, (_, s) => ({ position: s, reps: s + 1, weightTenthsKg: s === 0 ? null : 625 })) }));
      expected.unshift({ startedAt, completedAt, durationSeconds: 1800, exercises });
      expect((await repo.saveCompletedWorkout({ startedAt, exercises: exercises.map((e, ei) => ({ ...e, localKey: String(ei),
        sets: e.sets.map((s, si) => ({ ...s, localKey: String(si) })) })) }, completedAt)).ok).toBe(true);
    }
    const result = await repo.readExportSnapshot();
    expect(result.ok).toBe(true); if (!result.ok) throw new Error('Snapshot failed');
    const parsed = JSON.parse(encodeExportDocument(result.snapshot, '2026-10-12T00:00:00.000Z'));
    expect(parsed.workouts).toEqual(expected);
    expect(JSON.stringify(parsed)).not.toMatch(/"(?:id|localKey|draft)":/);
  } finally { f.dispose(); }
});

test('20轮保存/删除交错均导出同一快照，完成后允许新写入且旧内容不变', async () => {
  const f = sqliteFixture(); let hold = false, entered = deferred(), finish = deferred();
  const repo = createSqliteWorkoutRepository(async () => {
    const { connection } = f.open();
    return { ...connection, async getAllAsync<T>(sql: string, params: (number | string | null)[] = []) {
      const rows = await connection.getAllAsync<T>(sql, params);
      if (hold) { entered.resolve(); await finish.promise; }
      return rows;
    } };
  });
  const startedAt = '2026-10-12T01:00:00.000Z', completedAt = '2026-10-12T01:30:00.000Z';
  const draft = { startedAt, exercises: [{ localKey: 'e', name: '合成深蹲', position: 0,
    sets: [{ localKey: 's', position: 0, reps: 8, weightTenthsKg: 625 }] }] };
  try {
    const initial = await repo.saveCompletedWorkout(draft, completedAt);
    if (!initial.ok) throw new Error('Seed failed'); let id = initial.workoutId;
    for (let cycle = 0; cycle < 20; cycle++) {
      entered = deferred(); finish = deferred(); hold = true;
      const pending = repo.readExportSnapshot(); await entered.promise;
      expect(await repo.saveCompletedWorkout(draft, completedAt)).toEqual({ ok: false, code: 'Busy' });
      expect(await repo.deleteCompletedWorkout(id, true)).toEqual({ ok: false, code: 'Busy' });
      hold = false; finish.resolve(); const result = await pending;
      if (!result.ok) throw new Error('Snapshot failed');
      const before = encodeExportDocument(result.snapshot, completedAt);
      const next = await repo.saveCompletedWorkout(draft, completedAt);
      if (!next.ok) throw new Error('Lock leaked');
      expect(await repo.deleteCompletedWorkout(id, true)).toEqual({ ok: true }); id = next.workoutId;
      expect(encodeExportDocument(result.snapshot, completedAt)).toBe(before);
      const parsed = JSON.parse(before);
      expect(parsed.workouts).toHaveLength(1);
      expect(parsed.workouts[0].exercises[0].sets).toEqual([{ position: 0, reps: 8, weightTenthsKg: 625 }]);
    }
  } finally { hold = false; finish.resolve(); f.dispose(); }
});
