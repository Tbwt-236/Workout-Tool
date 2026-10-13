import { test, expect } from '@jest/globals';
import * as document from '../../src/features/data-control/domain/export-document';
import type { WorkoutExportSnapshot } from '../../src/features/workouts/data/workout-repository';

const at = '2026-10-12T03:00:00.000Z';
const sample: WorkoutExportSnapshot = { snapshotAt: at, workouts: [{ id: 90,
  startedAt: '2026-10-12T01:00:00.000Z', completedAt: '2026-10-12T01:30:00.000Z',
  durationSeconds: 1800, exerciseCount: 1, setCount: 2, exercises: [{ id: 91, name: '深蹲 "A" \\ 🏋️', position: 0,
    sets: [{ id: 92, position: 0, reps: 8, weightTenthsKg: null }, { id: 93, position: 1, reps: 10, weightTenthsKg: 625 }] }] }] };
test('JSON精确保留数值、单位、Unicode与顺序；只输出白名单，无内部ID和草稿', () => {
  expect(document).toHaveProperty('encodeExportDocument', expect.any(Function));
  const text = document.encodeExportDocument(sample, at);
  expect(JSON.parse(text)).toEqual({ format: 'fitquest-workouts', schemaVersion: 1, exportedAt: at, snapshotAt: at,
    weightUnit: 'tenths_of_kg', workouts: [{ startedAt: '2026-10-12T01:00:00.000Z', completedAt: '2026-10-12T01:30:00.000Z',
      durationSeconds: 1800, exercises: [{ name: '深蹲 "A" \\ 🏋️', position: 0, sets: [
        { position: 0, reps: 8, weightTenthsKg: null }, { position: 1, reps: 10, weightTenthsKg: 625 },
      ] }] }] });
});
test.each(['timestamp', 'reps', 'weight', 'duration', 'count'] as const)('非法%s拒绝编码，不隐式丢字段或转换成null', kind => {
  expect(document).toHaveProperty('encodeExportDocument', expect.any(Function));
  const bad = JSON.parse(JSON.stringify(sample));
  if (kind === 'timestamp') bad.snapshotAt = 'not-a-time';
  if (kind === 'reps') bad.workouts[0].exercises[0].sets[0].reps = NaN;
  if (kind === 'weight') bad.workouts[0].exercises[0].sets[0].weightTenthsKg = undefined;
  if (kind === 'duration') bad.workouts[0].durationSeconds = 5;
  if (kind === 'count') bad.workouts[0].setCount = 99;
  expect(() => document.encodeExportDocument(bad, at)).toThrow();
});
