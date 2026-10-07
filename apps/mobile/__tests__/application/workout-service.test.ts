import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { createWorkoutService } from '../../src/features/workouts/application/workout-service.ts';
import { initialWorkoutState, workoutReducer } from '../../src/features/workouts/application/workout-reducer.ts';
import type { WorkoutAction, WorkoutState } from '../../src/features/workouts/application/workout-reducer.ts';
import type { WorkoutDraft } from '../../src/features/workouts/domain/types.ts';
import type { SaveCompletedWorkoutResult, WorkoutSaveRepository } from '../../src/features/workouts/data/workout-repository.ts';

const startedAt = '2026-09-16T10:00:00.000Z';
const completedAt = '2026-09-16T10:30:00.000Z';

function validState(): WorkoutState {
  let state = workoutReducer(initialWorkoutState, { type: 'START', startedAt });
  state = workoutReducer(state, { type: 'ADD_EXERCISE', key: 'e1', name: '我的深蹲 Squat' });
  return workoutReducer(state, { type: 'ADD_SET', exerciseKey: 'e1', key: 's1', reps: 8, weightKg: '62.5' });
}

// Only the asynchronous storage boundary is replaced. The service and reducer are real.
function harness(initial: WorkoutState = validState(), options: { now?: () => string; newAttemptId?: () => string;
  save?: WorkoutSaveRepository['saveCompletedWorkout'] } = {}) {
  let state = initial;
  let sequence = 0;
  const writes: { draft: WorkoutDraft; completedAt: string;
    resolve: (result: SaveCompletedWorkoutResult) => void; reject: (reason: unknown) => void }[] = [];
  const repository: WorkoutSaveRepository = {
    saveCompletedWorkout: options.save ?? ((draft, time) => {
      return new Promise((resolve, reject) => writes.push({ draft, completedAt: time, resolve, reject }));
    }),
  };
  const statePort = {
    getState: () => state,
    transition(action: WorkoutAction) { state = workoutReducer(state, action); return state; },
  };
  const service = createWorkoutService({ repository, state: statePort,
    now: options.now ?? (() => completedAt), newAttemptId: options.newAttemptId ?? (() => `attempt-${++sequence}`) });
  return { service, writes, ...statePort };
}

function draftOf(state: WorkoutState) {
  assert.ok(state.status === 'active' || state.status === 'error' || state.status === 'completing');
  return state.draft;
}

test('点击完成先确认，未确认或点继续不调用保存接口且保留草稿', async () => {
  const h = harness();
  const draft = draftOf(h.getState());
  assert.deepEqual(await h.service.completeWorkout(true), { ok: false, code: 'NotConfirmed' });
  h.service.requestCompletion();
  const requested = h.getState();
  assert.ok(requested.status === 'active');
  assert.equal(requested.confirmation, 'complete');
  assert.deepEqual(await h.service.completeWorkout(false), { ok: false, code: 'NotConfirmed' });
  assert.equal(draftOf(h.getState()), draft);
  const state = h.getState();
  assert.ok(state.status === 'active');
  assert.equal(state.confirmation, null);
  assert.equal(h.writes.length, 0);
});

test('确认后进入保存中，提交前不清空，合法ID返回后才显示完成', async () => {
  const h = harness();
  const draft = draftOf(h.getState());
  h.service.requestCompletion();
  const saving = h.service.completeWorkout(true);
  assert.equal(h.getState().status, 'completing');
  assert.equal(draftOf(h.getState()), draft);
  assert.equal(h.writes.length, 1);
  assert.equal(h.writes[0].completedAt, completedAt);
  assert.deepEqual(h.writes[0].draft, draft);
  assert.notEqual(h.writes[0].draft, draft);
  assert.notEqual(h.writes[0].draft.exercises[0].sets[0], draft.exercises[0].sets[0]);
  h.writes[0].resolve({ ok: true, workoutId: 42 });
  assert.deepEqual(await saving, { ok: true, workoutId: 42 });
  assert.deepEqual(h.getState(), { status: 'completed', workoutId: 42, feedback: null });
});

test('同一时刻连续确认只发起一笔保存，完成后再次确认也不重复写入', async () => {
  const h = harness();
  h.service.requestCompletion();
  const first = h.service.completeWorkout(true);
  assert.equal(h.writes.length, 1);
  assert.deepEqual(await h.service.completeWorkout(true), { ok: false, code: 'Busy' });
  h.service.requestCompletion();
  assert.deepEqual(await h.service.completeWorkout(false), { ok: false, code: 'Busy' });
  assert.equal(h.writes.length, 1);
  h.writes[0].resolve({ ok: true, workoutId: 9 });
  await first;
  assert.deepEqual(await h.service.completeWorkout(true), { ok: false, code: 'NoActiveWorkout' });
  assert.equal(h.writes.length, 1);
});

test('空训练不能弹出完成确认或写库，没有训练时同样不保存', async () => {
  const h = harness(workoutReducer(initialWorkoutState, { type: 'START', startedAt }));
  const state = h.service.requestCompletion();
  assert.ok(state.status === 'active');
  assert.deepEqual(state.feedback, { code: 'ValidationError', field: 'exercises', reason: 'EmptyWorkout' });
  await h.service.completeWorkout(true);
  assert.equal(h.writes.length, 0);
  const idle = harness(initialWorkoutState);
  assert.deepEqual(await idle.service.completeWorkout(true), { ok: false, code: 'NoActiveWorkout' });
  assert.equal(idle.writes.length, 0);
});

test('仓储明确失败回到错误状态，原样保留草稿且不透出额外错误内容', async () => {
  for (const code of ['StorageUnavailable', 'UnexpectedStorageError', 'Busy'] as const) {
    const h = harness();
    const draft = draftOf(h.getState());
    h.service.requestCompletion();
    const saving = h.service.completeWorkout(true);
    const error = { ok: false as const, code, message: 'SQL error: /synthetic/private/path' };
    h.writes[0].resolve(error);
    const result = await saving;
    assert.equal(h.getState().status, 'error');
    assert.equal(draftOf(h.getState()), draft);
    assert.deepEqual(h.getState().feedback, { code: 'StorageUnavailable' });
    assert.deepEqual(result, { ok: false, code });
  }
});

test('同步异常和异步拒绝都返回安全失败，不抛出SQL或文件路径', async () => {
  for (const mode of ['throw', 'reject']) {
    const h = harness(validState(), { save: () => {
      if (mode === 'throw') throw new Error('SQL /synthetic/private/path');
      return Promise.reject(new Error('SQL /synthetic/private/path'));
    } });
    const draft = draftOf(h.getState());
    h.service.requestCompletion();
    const result = await h.service.completeWorkout(true).catch(() => 'unhandled rejection');
    assert.deepEqual(result, { ok: false, code: 'UnexpectedStorageError' });
    assert.equal(h.getState().status, 'error');
    assert.equal(draftOf(h.getState()), draft);
    assert.deepEqual(h.getState().feedback, { code: 'StorageUnavailable' });
  }
});

test('失败后须重新确认才能重试，新尝试只保存一次最新有效草稿', async () => {
  const h = harness();
  h.service.requestCompletion();
  const first = h.service.completeWorkout(true);
  const firstState = h.getState();
  assert.ok(firstState.status === 'completing');
  h.writes[0].resolve({ ok: false, code: 'StorageUnavailable' });
  await first;
  assert.deepEqual(await h.service.completeWorkout(true), { ok: false, code: 'NotConfirmed' });
  h.transition({ type: 'UPDATE_SET', exerciseKey: 'e1', setKey: 's1', reps: 10, weightKg: '60' });
  h.service.requestCompletion();
  const second = h.service.completeWorkout(true);
  const secondState = h.getState();
  assert.ok(secondState.status === 'completing');
  assert.notEqual(firstState.attemptId, secondState.attemptId);
  assert.equal(h.writes.length, 2);
  assert.equal(h.writes[1].draft.exercises[0].sets[0].reps, 10);
  assert.equal(h.writes[1].draft.exercises[0].sets[0].weightTenthsKg, 600);
  assert.deepEqual(await h.service.completeWorkout(true), { ok: false, code: 'Busy' });
  h.writes[1].resolve({ ok: true, workoutId: 77 });
  assert.deepEqual(await second, { ok: true, workoutId: 77 });
  assert.equal(h.getState().status, 'completed');
});

test('无效成功ID不能对调用者或训练状态宣称完成', async () => {
  for (const workoutId of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    const h = harness();
    h.service.requestCompletion();
    const saving = h.service.completeWorkout(true);
    h.writes[0].resolve({ ok: true, workoutId });
    assert.deepEqual(await saving, { ok: false, code: 'UnexpectedStorageError' });
    assert.equal(h.getState().status, 'error');
    assert.equal(draftOf(h.getState()).exercises[0].sets[0].reps, 8);
  }
});

test('仓储再次验证失败仍保留草稿并返回结构化字段原因', async () => {
  const h = harness();
  const draft = draftOf(h.getState());
  h.service.requestCompletion();
  const saving = h.service.completeWorkout(true);
  h.writes[0].resolve({ ok: false, code: 'ValidationError', field: 'exercises.0.sets.0.reps', reason: 'InvalidReps' });
  assert.deepEqual(await saving, { ok: false, code: 'ValidationError', field: 'exercises.0.sets.0.reps', reason: 'InvalidReps' });
  assert.equal(h.getState().status, 'error');
  assert.equal(draftOf(h.getState()), draft);
});

test('取消整场需对应确认，点继续保留草稿，确认取消从不调用保存', () => {
  const h = harness();
  const before = h.getState();
  assert.equal(h.service.cancelWorkout(true), before);
  const requested = h.service.requestCancellation();
  assert.ok(requested.status === 'active');
  assert.equal(requested.confirmation, 'cancel');
  h.service.cancelWorkout(false);
  assert.equal(draftOf(h.getState()), draftOf(before));
  h.service.requestCompletion();
  h.service.cancelWorkout(true);
  const complete = h.getState();
  assert.ok(complete.status === 'active');
  assert.equal(complete.confirmation, 'complete');
  h.service.requestCancellation();
  assert.deepEqual(h.service.cancelWorkout(true), initialWorkoutState);
  assert.equal(h.writes.length, 0);
});

test('没有内容时直接取消，未录入草稿的表单文字仍触发确认', () => {
  const empty = workoutReducer(initialWorkoutState, { type: 'START', startedAt });
  const h = harness(empty);
  assert.deepEqual(h.service.requestCancellation(), initialWorkoutState);
  const dirty = harness(empty);
  const requested = dirty.service.requestCancellation(true);
  assert.ok(requested.status === 'active');
  assert.equal(requested.confirmation, 'cancel');
  dirty.service.cancelWorkout(false);
  assert.equal(draftOf(dirty.getState()), draftOf(empty));
  assert.equal(dirty.writes.length, 0);
});

test('保存等待期间取消与编辑无效，不能提前清空或更改提交中的草稿', async () => {
  const h = harness();
  h.service.requestCompletion();
  const pending = h.service.completeWorkout(true);
  const saving = h.getState();
  assert.equal(h.service.requestCancellation(true), saving);
  assert.equal(h.service.cancelWorkout(true), saving);
  h.transition({ type: 'UPDATE_SET', exerciseKey: 'e1', setKey: 's1', reps: 99, weightKg: '' });
  assert.equal(h.getState(), saving);
  assert.equal(h.writes[0].draft.exercises[0].sets[0].reps, 8);
  h.writes[0].resolve({ ok: true, workoutId: 5 });
  await pending;
});

test('无效时间、标识及生成器异常在写入前安全拒绝并释放锁', async () => {
  const cases = [
    { now: () => 'bad', field: 'completedAt', reason: 'InvalidCompletedAt' },
    { now: () => { throw new Error('clock failed'); }, field: 'completedAt', reason: 'InvalidCompletedAt' },
    { newAttemptId: () => '', field: 'attemptId', reason: 'InvalidAttempt' },
    { newAttemptId: () => { throw new Error('id failed'); }, field: 'attemptId', reason: 'InvalidAttempt' },
  ] as const;
  for (const options of cases) {
    const h = harness(validState(), options);
    const draft = draftOf(h.getState());
    h.service.requestCompletion();
    const result = await h.service.completeWorkout(true).catch(() => 'unhandled rejection');
    assert.deepEqual(result, { ok: false, code: 'ValidationError', field: options.field, reason: options.reason });
    assert.equal(draftOf(h.getState()), draft);
    assert.equal(h.writes.length, 0);
    assert.deepEqual(await h.service.completeWorkout(true), { ok: false, code: 'NotConfirmed' });
  }
});

test('标识工厂重复返回旧ID时拒绝重试，避免迟到回执与新尝试混淆', async () => {
  const h = harness(validState(), { newAttemptId: () => 'same-id' });
  h.service.requestCompletion();
  const first = h.service.completeWorkout(true);
  h.writes[0].resolve({ ok: false, code: 'StorageUnavailable' });
  await first;
  h.service.requestCompletion();
  const result = h.service.completeWorkout(true);
  assert.equal(h.writes.length, 1);
  assert.deepEqual(await result, { ok: false, code: 'ValidationError', field: 'attemptId', reason: 'InvalidAttempt' });
});

test('旧保存回执到来时不能清空新训练，也不向调用者返回可导航的旧成功', async () => {
  const h = harness();
  h.service.requestCompletion();
  const first = h.service.completeWorkout(true);
  const saving = h.getState();
  assert.ok(saving.status === 'completing');
  // Simulate state replacement after an external lifecycle failure.
  h.transition({ type: 'SAVE_FAILED', attemptId: saving.attemptId });
  h.transition({ type: 'REQUEST_CANCEL' }); h.transition({ type: 'CONFIRM_CANCEL' });
  h.transition({ type: 'START', startedAt: '2026-09-16T11:00:00.000Z' });
  const next = h.getState();
  h.writes[0].resolve({ ok: true, workoutId: 42 });
  assert.deepEqual(await first, { ok: false, code: 'Superseded' });
  assert.equal(h.getState(), next);
});

test('即使有旧确认，损坏的聚合也必须在服务边界重新校验', async () => {
  const initial = validState();
  assert.ok(initial.status === 'active');
  const broken = structuredClone(initial);
  (broken.draft.exercises[0].sets[0] as { reps: number }).reps = 0;
  const h = harness({ ...broken, confirmation: 'complete' });
  assert.deepEqual(await h.service.completeWorkout(true), {
    ok: false, code: 'ValidationError', field: 'exercises.0.sets.0.reps', reason: 'InvalidReps',
  });
  assert.equal(h.writes.length, 0);
});
