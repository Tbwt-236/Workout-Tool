import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { validateWorkoutForCompletion } from '../../src/features/workouts/domain/validation.ts';

function validDraft() {
  return {
    startedAt: '2026-09-12T10:00:00.000Z',
    exercises: [{ localKey: 'e1', position: 0, name: '深蹲', sets: [
      { localKey: 's1', position: 0, reps: 8, weightTenthsKg: 625 },
    ] }],
  };
}

test('完整有效草稿通过，返回独立副本且不改写原始输入', () => {
  const draft = validDraft();
  draft.exercises[0].name = ' 深蹲 ';
  const before = structuredClone(draft);
  const result = validateWorkoutForCompletion(draft);
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error('expected valid draft');
  assert.equal(result.value.exercises[0].name, '深蹲');
  assert.equal(result.value.exercises[0].sets[0].weightTenthsKg, 625);
  assert.notEqual(result.value.exercises[0].sets[0], draft.exercises[0].sets[0]);
  assert.deepEqual(draft, before);
});

test('没有任何有效组时阻止完成，有其他有效组时保留空动作', () => {
  for (const exercises of [[], [{ localKey: 'e1', name: '深蹲', position: 0, sets: [] }]]) {
    assert.deepEqual(validateWorkoutForCompletion({ startedAt: validDraft().startedAt, exercises }), {
      ok: false, field: 'exercises', code: 'EmptyWorkout',
    });
  }
  const draft = validDraft();
  draft.exercises.push({ localKey: 'e2', name: '卧推', position: 1, sets: [] });
  const result = validateWorkoutForCompletion(draft);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.exercises.length, 2);
});

test('持久化边界重验所有组：一组有效不能掩盖另一组非法', () => {
  for (const bad of [{ reps: 0 }, { reps: 1.5 }, { reps: '8' }, { weightTenthsKg: 0 }, { weightTenthsKg: 10001 }, { weightTenthsKg: 625.5 }, { weightTenthsKg: '625' }, { weightTenthsKg: undefined }]) {
    const draft = validDraft();
    draft.exercises[0].sets.push({ localKey: 's2', position: 1, reps: 8, weightTenthsKg: 625, ...bad } as never);
    const result = validateWorkoutForCompletion(draft);
    assert.equal(result.ok, false, JSON.stringify(bad));
    if (!result.ok) assert.match(result.field, /^exercises\.0\.sets\.1\./);
  }
});

test('允许未记录重量，以及最小和最大领域数值', () => {
  for (const [reps, weightTenthsKg] of [[1, null], [999, 10000], [1, 1]] as const) {
    const draft = validDraft();
    Object.assign(draft.exercises[0].sets[0], { reps, weightTenthsKg });
    assert.equal(validateWorkoutForCompletion(draft).ok, true);
  }
});

test('拒绝破损结构、无效日期、非法动作名和不连续位置', () => {
  const draft = validDraft();
  for (const bad of [null, [], {}, { ...draft, startedAt: 'not a date' }, { ...draft, startedAt: '2026-02-30T10:00:00.000Z' }, { ...draft, exercises: null }, { ...draft, exercises: [null] }, { ...draft, exercises: [{ ...draft.exercises[0], name: ' ' }] }, { ...draft, exercises: [{ ...draft.exercises[0], position: 2 }] }, { ...draft, exercises: [{ ...draft.exercises[0], sets: [null] }] }]) {
    assert.equal(validateWorkoutForCompletion(bad).ok, false);
  }
});

test('拒绝重复内存键和组位置错乱，避免后续编辑指向错误记录', () => {
  const draft = validDraft();
  draft.exercises.push({ ...structuredClone(draft.exercises[0]), position: 1 });
  assert.equal(validateWorkoutForCompletion(draft).ok, false);
  const duplicateSet = validDraft();
  duplicateSet.exercises[0].sets.push({ ...duplicateSet.exercises[0].sets[0], position: 1 });
  assert.equal(validateWorkoutForCompletion(duplicateSet).ok, false);
  const wrongPosition = validDraft();
  wrongPosition.exercises[0].sets[0].position = 2;
  assert.equal(validateWorkoutForCompletion(wrongPosition).ok, false);
});
