import type { ValidationCode, WorkoutDraft } from '../domain/types.ts';
import { isUtcTimestamp } from '../domain/time.ts';
import { parseExerciseName, parseReps, parseWeightKg, validateWorkoutForCompletion } from '../domain/validation.ts';

export type WorkoutFeedback =
  | { readonly code: 'ValidationError'; readonly field: string; readonly reason: ValidationCode }
  | { readonly code: 'NotFound'; readonly target: 'exercise' | 'set' }
  | { readonly code: 'StorageUnavailable' };

export type WorkoutState =
  | { readonly status: 'idle'; readonly feedback: WorkoutFeedback | null }
  | { readonly status: 'active' | 'error'; readonly draft: WorkoutDraft;
      readonly confirmation: 'complete' | 'cancel' | null; readonly feedback: WorkoutFeedback | null }
  | { readonly status: 'completing'; readonly draft: WorkoutDraft;
      readonly attemptId: string; readonly completedAt: string; readonly feedback: null }
  | { readonly status: 'completed'; readonly workoutId: number; readonly feedback: null };

export type WorkoutAction =
  | { type: 'START'; startedAt: string }
  | { type: 'ADD_EXERCISE'; key: string; name: unknown }
  | { type: 'ADD_SET'; exerciseKey: string; key: string; reps: unknown; weightKg: unknown }
  | { type: 'RENAME_EXERCISE'; exerciseKey: string; name: unknown }
  | { type: 'UPDATE_SET'; exerciseKey: string; setKey: string; reps: unknown; weightKg: unknown }
  | { type: 'REMOVE_SET'; exerciseKey: string; setKey: string }
  | { type: 'REQUEST_COMPLETE' }
  | { type: 'KEEP_EDITING' }
  | { type: 'BEGIN_COMPLETION'; attemptId: string; completedAt: string }
  | { type: 'SAVE_SUCCEEDED'; attemptId: string; workoutId: number }
  | { type: 'SAVE_FAILED'; attemptId: string }
  | { type: 'REQUEST_CANCEL'; hasUnsavedInput?: boolean }
  | { type: 'CONFIRM_CANCEL' };

export const initialWorkoutState: WorkoutState = { status: 'idle', feedback: null };

type EditableState = Extract<WorkoutState, { status: 'active' | 'error' }>;

function validKey(key: string): boolean {
  return typeof key === 'string' && key.trim().length > 0;
}

function invalid(state: EditableState, field: string, reason: ValidationCode): EditableState {
  return { ...state, confirmation: null, feedback: { code: 'ValidationError', field, reason } };
}

function edited(draft: WorkoutDraft): EditableState {
  return { status: 'active', draft, confirmation: null, feedback: null };
}

function saveFailed(draft: WorkoutDraft): EditableState {
  return { status: 'error', draft, confirmation: null, feedback: {
    code: 'StorageUnavailable',
  } };
}

export function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  if (action.type === 'START') {
    if (state.status !== 'idle' && state.status !== 'completed') return state;
    if (!isUtcTimestamp(action.startedAt)) {
      return { status: 'idle', feedback: { code: 'ValidationError', field: 'startedAt', reason: 'InvalidStartedAt' } };
    }
    return edited({ startedAt: action.startedAt, exercises: [] });
  }
  if (state.status === 'completing') {
    if ((action.type !== 'SAVE_SUCCEEDED' && action.type !== 'SAVE_FAILED') || action.attemptId !== state.attemptId) return state;
    if (action.type === 'SAVE_FAILED' || !Number.isSafeInteger(action.workoutId) || action.workoutId <= 0) {
      return saveFailed(state.draft);
    }
    return { status: 'completed', workoutId: action.workoutId, feedback: null };
  }
  if (state.status !== 'active' && state.status !== 'error') return state;

  switch (action.type) {
    case 'RENAME_EXERCISE':
    case 'UPDATE_SET':
    case 'REMOVE_SET': {
      const exercise = state.draft.exercises.find(e => e.localKey === action.exerciseKey);
      if (!exercise) return { ...state, confirmation: null, feedback: { code: 'NotFound', target: 'exercise' } };
      let updated = exercise;
      if (action.type === 'RENAME_EXERCISE') {
        const name = parseExerciseName(action.name);
        if (!name.ok) return invalid(state, name.field, name.code);
        updated = { ...exercise, name: name.value };
      } else {
        const target = exercise.sets.find(s => s.localKey === action.setKey);
        if (!target) return { ...state, confirmation: null, feedback: { code: 'NotFound', target: 'set' } };
        if (action.type === 'REMOVE_SET') {
          updated = { ...exercise, sets: exercise.sets.filter(s => s !== target).map((s, position) => ({ ...s, position })) };
        } else {
          const reps = parseReps(action.reps);
          if (!reps.ok) return invalid(state, reps.field, reps.code);
          const weight = parseWeightKg(action.weightKg);
          if (!weight.ok) return invalid(state, weight.field, weight.code);
          updated = { ...exercise, sets: exercise.sets.map(s => s === target
            ? { ...s, reps: reps.value, weightTenthsKg: weight.value } : s) };
        }
      }
      return edited({ ...state.draft, exercises: state.draft.exercises.map(e => e === exercise ? updated : e) });
    }
    case 'REQUEST_CANCEL':
      if (state.draft.exercises.length === 0 && !action.hasUnsavedInput) return initialWorkoutState;
      return { ...state, confirmation: 'cancel' };
    case 'CONFIRM_CANCEL':
      return state.confirmation === 'cancel' ? initialWorkoutState : state;
    case 'REQUEST_COMPLETE': {
      const result = validateWorkoutForCompletion(state.draft);
      if (!result.ok) return invalid(state, result.field, result.code);
      return { ...state, status: 'active', confirmation: 'complete', feedback: null };
    }
    case 'KEEP_EDITING':
      return { ...state, confirmation: null };
    case 'BEGIN_COMPLETION': {
      if (state.confirmation !== 'complete') return state;
      if (!validKey(action.attemptId)) return invalid(state, 'attemptId', 'InvalidAttempt');
      if (!isUtcTimestamp(action.completedAt)) return invalid(state, 'completedAt', 'InvalidCompletedAt');
      const result = validateWorkoutForCompletion(state.draft);
      if (!result.ok) return invalid(state, result.field, result.code);
      return { status: 'completing', draft: state.draft, attemptId: action.attemptId, completedAt: action.completedAt, feedback: null };
    }
    case 'ADD_EXERCISE': {
      if (!validKey(action.key)) return invalid(state, 'localKey', 'InvalidExerciseKey');
      if (state.draft.exercises.some(e => e.localKey === action.key)) return state;
      const name = parseExerciseName(action.name);
      if (!name.ok) return invalid(state, name.field, name.code);
      return edited({ ...state.draft, exercises: [...state.draft.exercises, {
        localKey: action.key, position: state.draft.exercises.length, name: name.value, sets: [],
      }] });
    }
    case 'ADD_SET': {
      const exercise = state.draft.exercises.find(e => e.localKey === action.exerciseKey);
      if (!exercise) return { ...state, confirmation: null, feedback: { code: 'NotFound', target: 'exercise' } };
      if (!validKey(action.key)) return invalid(state, 'localKey', 'InvalidSetKey');
      if (exercise.sets.some(set => set.localKey === action.key)) return state;
      const reps = parseReps(action.reps);
      if (!reps.ok) return invalid(state, reps.field, reps.code);
      const weight = parseWeightKg(action.weightKg);
      if (!weight.ok) return invalid(state, weight.field, weight.code);
      const updated = { ...exercise, sets: [...exercise.sets, {
        localKey: action.key, position: exercise.sets.length, reps: reps.value, weightTenthsKg: weight.value,
      }] };
      return edited({ ...state.draft, exercises: state.draft.exercises.map(e => e === exercise ? updated : e) });
    }
    default: return state;
  }
}
