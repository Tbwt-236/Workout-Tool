import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { initialWorkoutState, workoutReducer } from '../../src/features/workouts/application/workout-reducer.ts';
import type { WorkoutAction, WorkoutState } from '../../src/features/workouts/application/workout-reducer.ts';

const startedAt = '2026-09-13T10:00:00.000Z';

function active(state: WorkoutState) {
  assert.ok(state.status === 'active' || state.status === 'error');
  return state;
}

function start() {
  return active(workoutReducer(initialWorkoutState, { type: 'START', startedAt }));
}

function withExercise() {
  return active(workoutReducer(start(), { type: 'ADD_EXERCISE', key: 'e1', name: ' 深蹲 ' }));
}

function withSet() {
  return active(workoutReducer(withExercise(), { type: 'ADD_SET', exerciseKey: 'e1', key: 's1', reps: '8', weightKg: '62.5' }));
}

test('开始创建唯一草稿，重复开始不会覆盖原开始时间或数据', () => {
  const state = start();
  assert.deepEqual(state, { status: 'active', draft: { startedAt, exercises: [] }, confirmation: null, feedback: null });
  assert.equal(workoutReducer(state, { type: 'START', startedAt: '2026-09-13T10:05:00.000Z' }), state);
});

test('无效开始日期不创建草稿并给出可理解反馈', () => {
  const state = workoutReducer(initialWorkoutState, { type: 'START', startedAt: '2026-02-30T10:00:00.000Z' });
  assert.equal(state.status, 'idle');
  assert.equal(state.feedback?.code, 'ValidationError');
  assert.deepEqual(state.feedback, { code: 'ValidationError', field: 'startedAt', reason: 'InvalidStartedAt' });
});

test('新增动作规范化名称和顺序，重复键不再添加', () => {
  const first = withExercise();
  const second = active(workoutReducer(first, { type: 'ADD_EXERCISE', key: 'e2', name: '卧推' }));
  assert.deepEqual(second.draft.exercises.map(e => [e.localKey, e.name, e.position]), [['e1', '深蹲', 0], ['e2', '卧推', 1]]);
  assert.equal(workoutReducer(second, { type: 'ADD_EXERCISE', key: 'e2', name: '另一个动作' }), second);
  const invalid = active(workoutReducer(second, { type: 'ADD_EXERCISE', key: 'e3', name: ' ' }));
  assert.equal(invalid.draft, second.draft);
  assert.ok(invalid.feedback?.code === 'ValidationError');
  assert.equal(invalid.feedback?.field, 'name');
});

test('新增训练组存入规范数值，支持无重量，重复键不增加组', () => {
  const first = withSet();
  assert.deepEqual(first.draft.exercises[0].sets[0], { localKey: 's1', position: 0, reps: 8, weightTenthsKg: 625 });
  const next = active(workoutReducer(first, { type: 'ADD_SET', exerciseKey: 'e1', key: 's2', reps: 12, weightKg: '' }));
  assert.deepEqual(next.draft.exercises[0].sets[1], { localKey: 's2', position: 1, reps: 12, weightTenthsKg: null });
  assert.equal(workoutReducer(next, { type: 'ADD_SET', exerciseKey: 'e1', key: 's2', reps: 10, weightKg: 40 }), next);
});

test('非法组输入不进入草稿，反馈定位次数或重量', () => {
  const state = withExercise();
  for (const [reps, weightKg, field] of [[0, '62.5', 'reps'], [8, '62.55', 'weightKg']] as const) {
    const invalid = active(workoutReducer(state, { type: 'ADD_SET', exerciseKey: 'e1', key: 's1', reps, weightKg }));
    assert.equal(invalid.draft, state.draft);
    assert.ok(invalid.feedback?.code === 'ValidationError');
    assert.equal(invalid.feedback?.field, field);
  }
});

test('新增时拒绝空键及不存在动作，不能把组记到其他动作上', () => {
  const state = withExercise();
  const emptyKey = active(workoutReducer(state, { type: 'ADD_EXERCISE', key: ' ', name: '卧推' }));
  assert.equal(emptyKey.draft, state.draft);
  assert.equal(emptyKey.feedback?.code, 'ValidationError');
  const absent = active(workoutReducer(state, { type: 'ADD_SET', exerciseKey: 'missing', key: 's1', reps: 8, weightKg: '' }));
  assert.equal(absent.draft, state.draft);
  assert.equal(absent.feedback?.code, 'NotFound');
});

test('纯状态更新不改写旧草稿，未开始时录入操作没有效果', () => {
  assert.equal(workoutReducer(initialWorkoutState, { type: 'ADD_EXERCISE', key: 'e1', name: '深蹲' }), initialWorkoutState);
  const before = withExercise();
  Object.freeze(before.draft.exercises[0].sets);
  Object.freeze(before.draft.exercises[0]);
  Object.freeze(before.draft.exercises);
  Object.freeze(before.draft);
  Object.freeze(before);
  const after = active(workoutReducer(before, { type: 'ADD_SET', exerciseKey: 'e1', key: 's1', reps: 8, weightKg: '62.5' }));
  assert.equal(before.draft.exercises[0].sets.length, 0);
  assert.equal(after.draft.exercises[0].sets.length, 1);
});

const completedAt = '2026-09-13T10:30:00.000Z';

function saving(state: WorkoutState = withSet(), attemptId = 'save-1') {
  const requested = workoutReducer(state, { type: 'REQUEST_COMPLETE' });
  const result = workoutReducer(requested, { type: 'BEGIN_COMPLETION', attemptId, completedAt });
  assert.equal(result.status, 'completing');
  if (result.status !== 'completing') throw new Error('expected save in progress');
  return result;
}

test('空训练和只有动作没有组时不能进入完成确认', () => {
  for (const state of [start(), withExercise()]) {
    const result = active(workoutReducer(state, { type: 'REQUEST_COMPLETE' }));
    assert.equal(result.confirmation, null);
    assert.equal(result.draft, state.draft);
    assert.ok(result.feedback?.code === 'ValidationError');
    assert.equal(result.feedback?.field, 'exercises');
    assert.deepEqual(result.feedback, { code: 'ValidationError', field: 'exercises', reason: 'EmptyWorkout' });
  }
});

test('完成需要先请求确认，继续编辑保留原草稿并撤销确认', () => {
  const state = withSet();
  assert.equal(workoutReducer(state, { type: 'BEGIN_COMPLETION', attemptId: 'save-1', completedAt }), state);
  const requested = active(workoutReducer(state, { type: 'REQUEST_COMPLETE' }));
  assert.equal(requested.confirmation, 'complete');
  assert.equal(requested.draft, state.draft);
  const kept = active(workoutReducer(requested, { type: 'KEEP_EDITING' }));
  assert.equal(kept.confirmation, null);
  assert.equal(kept.draft, state.draft);
});

test('记录变动使原完成确认失效，避免旧弹窗完成新内容', () => {
  const requested = active(workoutReducer(withSet(), { type: 'REQUEST_COMPLETE' }));
  assert.equal(requested.confirmation, 'complete');
  const changed = active(workoutReducer(requested, { type: 'ADD_SET', exerciseKey: 'e1', key: 's2', reps: 10, weightKg: 40 }));
  assert.equal(changed.confirmation, null);
  assert.equal(workoutReducer(changed, { type: 'BEGIN_COMPLETION', attemptId: 'save-1', completedAt }), changed);
});

test('无效完成日期或空尝试标识不进入保存中，时钟回拨仍可保存', () => {
  const requested = workoutReducer(withSet(), { type: 'REQUEST_COMPLETE' });
  for (const payload of [{ attemptId: '', completedAt }, { attemptId: 'save-1', completedAt: '2026-02-30T00:00:00.000Z' }]) {
    const rejected = active(workoutReducer(requested, { type: 'BEGIN_COMPLETION', ...payload }));
    assert.equal(rejected.feedback?.code, 'ValidationError');
  }
  const backwards = workoutReducer(requested, { type: 'BEGIN_COMPLETION', attemptId: 'save-1', completedAt: '2026-09-13T09:00:00.000Z' });
  assert.equal(backwards.status, 'completing');
});

test('保存过程中开始、编辑、取消及重复完成都不能改变草稿或尝试', () => {
  const state = saving();
  const actions: WorkoutAction[] = [
    { type: 'START', startedAt }, { type: 'ADD_EXERCISE', key: 'e2', name: '卧推' },
    { type: 'ADD_SET', exerciseKey: 'e1', key: 's2', reps: 8, weightKg: '' },
    { type: 'REQUEST_CANCEL' }, { type: 'CONFIRM_CANCEL' }, { type: 'KEEP_EDITING' },
    { type: 'REQUEST_COMPLETE' }, { type: 'BEGIN_COMPLETION', attemptId: 'save-2', completedAt },
  ];
  for (const action of actions) assert.equal(workoutReducer(state, action), state, action.type);
});

test('保存失败原样保留草稿，给出不泄漏实现信息的可重试反馈', () => {
  const state = saving();
  const failed = active(workoutReducer(state, { type: 'SAVE_FAILED', attemptId: 'save-1' }));
  assert.equal(failed.status, 'error');
  assert.equal(failed.draft, state.draft);
  assert.equal(failed.confirmation, null);
  assert.deepEqual(failed.feedback, { code: 'StorageUnavailable' });
  assert.equal(workoutReducer(failed, { type: 'START', startedAt }), failed);
  assert.equal(saving(failed, 'save-2').attemptId, 'save-2');
});

test('仅当前尝试的成功能清除草稿并给出唯一完成ID，重复结果无作用', () => {
  const state = saving();
  const result = workoutReducer(state, { type: 'SAVE_SUCCEEDED', attemptId: 'save-1', workoutId: 42 });
  assert.deepEqual(result, { status: 'completed', workoutId: 42, feedback: null });
  assert.equal(workoutReducer(result, { type: 'SAVE_SUCCEEDED', attemptId: 'save-1', workoutId: 43 }), result);
  assert.equal(active(workoutReducer(result, { type: 'START', startedAt })).draft.exercises.length, 0);
});

test('旧尝试的迟到成功或失败不能覆盖重试中的当前训练', () => {
  const failed = workoutReducer(saving(), { type: 'SAVE_FAILED', attemptId: 'save-1' });
  const retry = saving(failed, 'save-2');
  assert.equal(workoutReducer(retry, { type: 'SAVE_SUCCEEDED', attemptId: 'save-1', workoutId: 42 }), retry);
  assert.equal(workoutReducer(retry, { type: 'SAVE_FAILED', attemptId: 'save-1' }), retry);
});

test('无效保存ID不能生成虚假完成状态', () => {
  const state = saving();
  for (const workoutId of [0, -1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    const rejected = active(workoutReducer(state, { type: 'SAVE_SUCCEEDED', attemptId: 'save-1', workoutId }));
    assert.equal(rejected.status, 'error');
    assert.equal(rejected.draft, state.draft);
  }
});

test('无内容时可直接取消，已有动作时必须确认且继续编辑不丢内容', () => {
  assert.deepEqual(workoutReducer(start(), { type: 'REQUEST_CANCEL' }), initialWorkoutState);
  const state = withExercise();
  assert.equal(workoutReducer(state, { type: 'CONFIRM_CANCEL' }), state);
  const requested = active(workoutReducer(state, { type: 'REQUEST_CANCEL' }));
  assert.equal(requested.confirmation, 'cancel');
  assert.equal(requested.draft, state.draft);
  const kept = active(workoutReducer(requested, { type: 'KEEP_EDITING' }));
  assert.equal(kept.confirmation, null);
  assert.equal(kept.draft, state.draft);
  assert.deepEqual(workoutReducer(requested, { type: 'CONFIRM_CANCEL' }), initialWorkoutState);
});

test('尚在表单中未保存的文字也需要取消确认', () => {
  const state = start();
  const requested = active(workoutReducer(state, { type: 'REQUEST_CANCEL', hasUnsavedInput: true }));
  assert.equal(requested.confirmation, 'cancel');
  assert.equal(requested.draft, state.draft);
});

test('完成和取消确认不能互相代替，取消后旧保存回调无作用', () => {
  const complete = active(workoutReducer(withSet(), { type: 'REQUEST_COMPLETE' }));
  assert.equal(complete.confirmation, 'complete');
  assert.equal(workoutReducer(complete, { type: 'CONFIRM_CANCEL' }), complete);
  const cancel = active(workoutReducer(complete, { type: 'REQUEST_CANCEL' }));
  assert.equal(cancel.confirmation, 'cancel');
  assert.equal(workoutReducer(cancel, { type: 'BEGIN_COMPLETION', attemptId: 'save-1', completedAt }), cancel);
  const idle = workoutReducer(cancel, { type: 'CONFIRM_CANCEL' });
  assert.equal(workoutReducer(idle, { type: 'SAVE_SUCCEEDED', attemptId: 'save-1', workoutId: 42 }), idle);
});

test('应用反馈区分不可用动作、输入错误及保存参数错误，不携带显示文案', () => {
  const state = withSet();
  const cases: [WorkoutAction, unknown][] = [
    [{ type: 'ADD_EXERCISE', key: '', name: '卧推' }, { code: 'ValidationError', field: 'localKey', reason: 'InvalidExerciseKey' }],
    [{ type: 'ADD_SET', exerciseKey: 'e1', key: '', reps: 8, weightKg: '' }, { code: 'ValidationError', field: 'localKey', reason: 'InvalidSetKey' }],
    [{ type: 'ADD_SET', exerciseKey: 'missing', key: 's2', reps: 8, weightKg: '' }, { code: 'NotFound', target: 'exercise' }],
    [{ type: 'ADD_SET', exerciseKey: 'e1', key: 's2', reps: 0, weightKg: '' }, { code: 'ValidationError', field: 'reps', reason: 'InvalidReps' }],
    [{ type: 'ADD_SET', exerciseKey: 'e1', key: 's2', reps: 8, weightKg: '0' }, { code: 'ValidationError', field: 'weightKg', reason: 'InvalidWeight' }],
    [{ type: 'BEGIN_COMPLETION', attemptId: '', completedAt }, { code: 'ValidationError', field: 'attemptId', reason: 'InvalidAttempt' }],
    [{ type: 'BEGIN_COMPLETION', attemptId: 'save-1', completedAt: 'bad' }, { code: 'ValidationError', field: 'completedAt', reason: 'InvalidCompletedAt' }],
  ];
  for (const [action, feedback] of cases) {
    const result = active(workoutReducer(workoutReducer(state, { type: 'REQUEST_COMPLETE' }), action));
    assert.deepEqual(result.feedback, feedback);
    assert.equal(result.draft, state.draft);
  }
});
