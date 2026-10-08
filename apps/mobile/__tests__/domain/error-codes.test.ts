import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { validateWorkoutForCompletion } from '../../src/features/workouts/domain/validation.ts';

test('破损聚合返回稳定原因与精确字段，不把中文句子当业务接口', () => {
  const set = { localKey: 's1', position: 0, reps: 8, weightTenthsKg: 625 };
  const exercise = { localKey: 'e1', position: 0, name: '深蹲', sets: [set] };
  const draft = { startedAt: '2026-09-15T10:00:00.000Z', exercises: [exercise] };
  const cases = [
    [null, 'exercises', 'InvalidWorkout'],
    [{ ...draft, startedAt: 'bad' }, 'startedAt', 'InvalidStartedAt'],
    [{ ...draft, exercises: [null] }, 'exercises.0', 'InvalidExercise'],
    [{ ...draft, exercises: [{ ...exercise, localKey: '' }] }, 'exercises.0.localKey', 'InvalidExerciseKey'],
    [{ ...draft, exercises: [{ ...exercise, position: 1 }] }, 'exercises.0.position', 'InvalidExercisePosition'],
    [{ ...draft, exercises: [{ ...exercise, name: ' ' }] }, 'exercises.0.name', 'InvalidExerciseName'],
    [{ ...draft, exercises: [{ ...exercise, sets: [null] }] }, 'exercises.0.sets.0', 'InvalidSet'],
    [{ ...draft, exercises: [{ ...exercise, sets: [{ ...set, localKey: '' }] }] }, 'exercises.0.sets.0.localKey', 'InvalidSetKey'],
    [{ ...draft, exercises: [{ ...exercise, sets: [{ ...set, position: 1 }] }] }, 'exercises.0.sets.0.position', 'InvalidSetPosition'],
    [{ ...draft, exercises: [{ ...exercise, sets: [{ ...set, reps: 0 }] }] }, 'exercises.0.sets.0.reps', 'InvalidReps'],
    [{ ...draft, exercises: [{ ...exercise, sets: [{ ...set, weightTenthsKg: 0 }] }] }, 'exercises.0.sets.0.weightTenthsKg', 'InvalidWeight'],
  ] as const;
  for (const [input, field, code] of cases) {
    assert.deepEqual(validateWorkoutForCompletion(input), { ok: false, field, code });
  }
});
