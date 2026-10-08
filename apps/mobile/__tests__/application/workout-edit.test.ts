import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { workoutReducer } from '../../src/features/workouts/application/workout-reducer.ts';
import type { WorkoutState, WorkoutAction } from '../../src/features/workouts/application/workout-reducer.ts';
import { summarizeWorkout } from '../../src/features/workouts/domain/calculations.ts';

function fixture(): Extract<WorkoutState, { status: 'active' | 'error' }> {
  return { status: 'active', feedback: null, confirmation: null, draft: {
    startedAt: '2026-09-15T10:00:00.000Z', exercises: [
      { localKey: 'e1', position: 0, name: '深蹲', sets: [
        { localKey: 's1', position: 0, reps: 8, weightTenthsKg: 625 },
        { localKey: 's2', position: 1, reps: 6, weightTenthsKg: 650 },
        { localKey: 's3', position: 2, reps: 5, weightTenthsKg: 675 },
      ] },
      { localKey: 'e2', position: 1, name: '卧推', sets: [
        { localKey: 's1', position: 0, reps: 12, weightTenthsKg: null },
      ] },
    ],
  } };
}

function editable(state: WorkoutState) {
  assert.ok(state.status === 'active' || state.status === 'error');
  return state;
}

function frozenFixture() {
  const state = fixture();
  for (const exercise of state.draft.exercises) {
    exercise.sets.forEach(Object.freeze);
    Object.freeze(exercise.sets);
    Object.freeze(exercise);
  }
  Object.freeze(state.draft.exercises); Object.freeze(state.draft); Object.freeze(state);
  return state;
}

test('改名仅作用于目标动作，trim但保留自填中英名称及原始组数据', () => {
  const before = frozenFixture();
  const after = editable(workoutReducer(before, { type: 'RENAME_EXERCISE', exerciseKey: 'e1', name: '  后蹲 Squat  ' }));
  assert.equal(after.draft.exercises[0].name, '后蹲 Squat');
  assert.equal(after.draft.exercises[0].sets, before.draft.exercises[0].sets);
  assert.equal(after.draft.exercises[1], before.draft.exercises[1]);
  assert.equal(before.draft.exercises[0].name, '深蹲');
});

test('修改组按动作和组键共同定位，保持位置与总组数，可清空重量', () => {
  const before = frozenFixture();
  let after = editable(workoutReducer(before, { type: 'UPDATE_SET', exerciseKey: 'e1', setKey: 's1', reps: '10', weightKg: '60.5' }));
  assert.deepEqual(after.draft.exercises[0].sets[0], { localKey: 's1', position: 0, reps: 10, weightTenthsKg: 605 });
  assert.equal(after.draft.exercises[1], before.draft.exercises[1]);
  assert.equal(after.draft.exercises[0].sets[1], before.draft.exercises[0].sets[1]);
  assert.equal(before.draft.exercises[0].sets[0].reps, 8);
  after = editable(workoutReducer(after, { type: 'UPDATE_SET', exerciseKey: 'e1', setKey: 's1', reps: 1, weightKg: '' }));
  assert.equal(after.draft.exercises[0].sets[0].weightTenthsKg, null);
  assert.equal(summarizeWorkout(after.draft).setCount, 4);
});

test('删除中间组只移除目标，后续位置连续，另一个动作同名组键不受影响', () => {
  const before = frozenFixture();
  const after = editable(workoutReducer(before, { type: 'REMOVE_SET', exerciseKey: 'e1', setKey: 's2' }));
  assert.deepEqual(after.draft.exercises[0].sets.map(s => [s.localKey, s.position, s.reps]), [['s1', 0, 8], ['s3', 1, 5]]);
  assert.equal(summarizeWorkout(after.draft).setCount, 3);
  const again = editable(workoutReducer(after, { type: 'REMOVE_SET', exerciseKey: 'e1', setKey: 's1' }));
  assert.deepEqual(again.draft.exercises[0].sets.map(s => [s.localKey, s.position]), [['s3', 0]]);
  assert.equal(again.draft.exercises[1], before.draft.exercises[1]);
  assert.equal(before.draft.exercises[0].sets.length, 3);
});

test('删除所有有效组后仍保留动作但阻止完成', () => {
  let state: WorkoutState = fixture();
  for (const [exerciseKey, setKey] of [['e1', 's1'], ['e1', 's2'], ['e1', 's3'], ['e2', 's1']]) {
    state = workoutReducer(state, { type: 'REMOVE_SET', exerciseKey, setKey });
  }
  const after = editable(workoutReducer(state, { type: 'REQUEST_COMPLETE' }));
  assert.equal(after.draft.exercises.length, 2);
  assert.equal(summarizeWorkout(after.draft).setCount, 0);
  assert.equal(after.confirmation, null);
  assert.deepEqual(after.feedback, { code: 'ValidationError', field: 'exercises', reason: 'EmptyWorkout' });
});

test('无效修改保持整个旧草稿，明确指出名称/次数/重量错误', () => {
  const before = fixture();
  const cases: [WorkoutAction, string][] = [
    [{ type: 'RENAME_EXERCISE', exerciseKey: 'e1', name: ' ' }, 'name'],
    [{ type: 'RENAME_EXERCISE', exerciseKey: 'e1', name: 'x'.repeat(81) }, 'name'],
    [{ type: 'UPDATE_SET', exerciseKey: 'e1', setKey: 's1', reps: 0, weightKg: '' }, 'reps'],
    [{ type: 'UPDATE_SET', exerciseKey: 'e1', setKey: 's1', reps: 8, weightKg: '62.55' }, 'weightKg'],
  ];
  for (const [action, field] of cases) {
    const after = editable(workoutReducer(before, action));
    assert.equal(after.draft, before.draft);
    assert.equal(after.feedback?.code, 'ValidationError');
    assert.ok(after.feedback?.code === 'ValidationError');
    assert.equal(after.feedback.field, field);
  }
});

test('已删除或不存在的目标返回NotFound，不能误写到首个动作或组', () => {
  const before = fixture();
  const cases: [WorkoutAction, 'exercise' | 'set'][] = [
    [{ type: 'RENAME_EXERCISE', exerciseKey: 'missing', name: '新名' }, 'exercise'],
    [{ type: 'UPDATE_SET', exerciseKey: 'missing', setKey: 's1', reps: 8, weightKg: '' }, 'exercise'],
    [{ type: 'REMOVE_SET', exerciseKey: 'missing', setKey: 's1' }, 'exercise'],
    [{ type: 'UPDATE_SET', exerciseKey: 'e1', setKey: 'missing', reps: 8, weightKg: '' }, 'set'],
    [{ type: 'REMOVE_SET', exerciseKey: 'e1', setKey: 'missing' }, 'set'],
  ];
  for (const [action, target] of cases) {
    const after = editable(workoutReducer(before, action));
    assert.deepEqual(after.feedback, { code: 'NotFound', target });
    assert.equal(after.draft, before.draft);
  }
});

const edits: WorkoutAction[] = [
  { type: 'RENAME_EXERCISE', exerciseKey: 'e1', name: '后蹲' },
  { type: 'UPDATE_SET', exerciseKey: 'e1', setKey: 's1', reps: 10, weightKg: 60 },
  { type: 'REMOVE_SET', exerciseKey: 'e1', setKey: 's1' },
];

test('改名/修改/删除使旧完成或取消确认失效，错误状态编辑后可重新完成', () => {
  for (const confirmation of ['complete', 'cancel'] as const) {
    for (const action of edits) {
      const before = { ...fixture(), status: 'error' as const, feedback: { code: 'StorageUnavailable' as const }, confirmation };
      const after = editable(workoutReducer(before, action));
      assert.equal(after.status, 'active');
      assert.equal(after.confirmation, null);
      assert.equal(after.feedback, null);
      assert.equal(workoutReducer(after, { type: 'CONFIRM_CANCEL' }), after);
      assert.equal(workoutReducer(after, { type: 'BEGIN_COMPLETION', attemptId: 'x', completedAt: '2026-09-15T11:00:00.000Z' }), after);
    }
  }
});

test('完成中和已完成训练拒绝所有纠错事件，保存快照不会被改写', () => {
  const requested = workoutReducer(fixture(), { type: 'REQUEST_COMPLETE' });
  const saving = workoutReducer(requested, { type: 'BEGIN_COMPLETION', attemptId: 'x', completedAt: '2026-09-15T11:00:00.000Z' });
  assert.equal(saving.status, 'completing');
  const done = workoutReducer(saving, { type: 'SAVE_SUCCEEDED', attemptId: 'x', workoutId: 42 });
  for (const action of edits) {
    assert.equal(workoutReducer(saving, action), saving);
    assert.equal(workoutReducer(done, action), done);
  }
});
