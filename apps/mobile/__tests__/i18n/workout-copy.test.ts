import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { feedbackMessage, formatCount, getWorkoutCopy } from '../../src/i18n/workout-copy.ts';
import { initialWorkoutState, workoutReducer } from '../../src/features/workouts/application/workout-reducer.ts';

test('默认中文，短按钮区分组记录与整场完成，确认语保留操作对象', () => {
  const zh = getWorkoutCopy();
  const en = getWorkoutCopy('en');
  assert.equal(zh.log, '记录');
  assert.equal(zh.finish, '完成');
  assert.equal(en.log, 'Log');
  assert.equal(en.finish, 'Finish');
  assert.equal(zh.confirmFinish, '完成训练？');
  assert.equal(en.confirmFinish, 'Finish workout?');
  assert.equal(zh.weight, '重量 · kg');
  assert.equal(en.weight, 'Weight · kg');
  assert.match(zh.optionalWeight, /选填/);
  assert.match(en.optionalWeight, /Optional/);
});

test('已定义的中英文字典同键且无空翻译，英文界面不残留中文', () => {
  const zh = getWorkoutCopy('zh');
  const en = getWorkoutCopy('en');
  assert.ok(Object.keys(zh).length > 0);
  assert.deepEqual(Object.keys(zh).sort(), Object.keys(en).sort());
  for (const key of Object.keys(zh) as (keyof typeof zh)[]) {
    assert.ok(zh[key].trim().length > 0, key);
    assert.ok(en[key].trim().length > 0, key);
    assert.doesNotMatch(en[key], /\p{Script=Han}/u, key);
  }
});

test('计数正确区分英文单复数，中文零值与多值可读', () => {
  assert.equal(formatCount('zh', 'sets', 0), '0 组');
  assert.equal(formatCount('zh', 'exercises', 2), '2 个动作');
  assert.equal(formatCount('en', 'sets', 0), '0 sets');
  assert.equal(formatCount('en', 'sets', 1), '1 set');
  assert.equal(formatCount('en', 'sets', 2), '2 sets');
  assert.equal(formatCount('en', 'exercises', 1), '1 exercise');
  assert.equal(formatCount('en', 'exercises', 2), '2 exercises');
});

test('全部验证原因与目标错误可分别显示中英文，保存失败不能暗示成功', () => {
  const reasons = ['InvalidWorkout', 'InvalidStartedAt', 'InvalidExercise', 'InvalidExerciseKey',
    'InvalidExercisePosition', 'InvalidExerciseName', 'InvalidSet', 'InvalidSetKey',
    'InvalidSetPosition', 'InvalidReps', 'InvalidWeight', 'EmptyWorkout', 'InvalidAttempt', 'InvalidCompletedAt'] as const;
  for (const reason of reasons) {
    const feedback = { code: 'ValidationError', field: 'test', reason } as const;
    assert.match(feedbackMessage('zh', feedback), /\p{Script=Han}/u, reason);
    assert.match(feedbackMessage('en', feedback), /[A-Za-z]/, reason);
    assert.doesNotMatch(feedbackMessage('en', feedback), /\p{Script=Han}/u, reason);
  }
  assert.equal(feedbackMessage('en', { code: 'ValidationError', field: 'reps', reason: 'InvalidReps' }), 'Enter a whole number from 1 to 999.');
  assert.equal(feedbackMessage('zh', { code: 'ValidationError', field: 'weightKg', reason: 'InvalidWeight' }), '重量须大于 0、不超过 1000 kg，最多一位小数；也可留空');
  assert.equal(feedbackMessage('en', { code: 'NotFound', target: 'exercise' }), 'Exercise not found. Select another.');
  assert.equal(feedbackMessage('en', { code: 'NotFound', target: 'set' }), 'Set not found. Select another.');
  assert.equal(feedbackMessage('en', { code: 'StorageUnavailable' }), 'Not saved. Your workout is kept in this session. Retry.');
  assert.equal(feedbackMessage('zh', null), '');
});

test('按不同语言读取同一状态的提示不改写草稿、自填名称或确认状态', () => {
  let state = workoutReducer(initialWorkoutState, { type: 'START', startedAt: '2026-09-15T10:00:00.000Z' });
  state = workoutReducer(state, { type: 'ADD_EXERCISE', key: 'e1', name: '我的卧推 Bench' });
  state = workoutReducer(state, { type: 'ADD_SET', exerciseKey: 'e1', key: 's1', reps: 0, weightKg: '62.5' });
  state = workoutReducer(state, { type: 'REQUEST_CANCEL' });
  const before = structuredClone(state);
  assert.equal(feedbackMessage('en', state.feedback), 'Enter a whole number from 1 to 999.');
  assert.equal(feedbackMessage('zh', state.feedback), '次数须为 1–999 的整数');
  assert.deepEqual(state, before);
  assert.ok(state.status === 'active' || state.status === 'error');
  assert.equal(state.draft.exercises[0].name, '我的卧推 Bench');
  assert.equal(state.confirmation, 'cancel');
});
