import type { WorkoutAction, WorkoutState } from './workout-reducer.ts';
import type { SaveCompletedWorkoutResult, WorkoutSaveRepository } from '../data/workout-repository.ts';
import { validateWorkoutForCompletion } from '../domain/validation.ts';

export interface WorkoutStatePort {
  getState(): WorkoutState;
  // Must apply the reducer synchronously before returning; not a raw React dispatch.
  transition(action: WorkoutAction): WorkoutState;
}

export interface WorkoutServiceDependencies {
  readonly state: WorkoutStatePort;
  readonly repository: WorkoutSaveRepository;
  readonly now: () => string;
  readonly newAttemptId: () => string;
}

export type CompletionResult = SaveCompletedWorkoutResult
  | { readonly ok: false; readonly code: 'NotConfirmed' | 'NoActiveWorkout' | 'Superseded' };

export function createWorkoutService(dependencies: WorkoutServiceDependencies) {
  const { state, repository, now, newAttemptId } = dependencies;
  let inFlight = false;
  const usedAttempts = new Set<string>();
  return {
    requestCancellation: (hasUnsavedInput = false) => inFlight ? state.getState()
      : state.transition({ type: 'REQUEST_CANCEL', hasUnsavedInput }),
    cancelWorkout(confirmed: boolean): WorkoutState {
      const current = state.getState();
      if (inFlight || (current.status !== 'active' && current.status !== 'error') || current.confirmation !== 'cancel') return current;
      return state.transition({ type: confirmed ? 'CONFIRM_CANCEL' : 'KEEP_EDITING' });
    },
    requestCompletion: () => inFlight ? state.getState() : state.transition({ type: 'REQUEST_COMPLETE' }),
    async completeWorkout(confirmed: boolean): Promise<CompletionResult> {
      const current = state.getState();
      if (inFlight || current.status === 'completing') return { ok: false, code: 'Busy' };
      if (current.status !== 'active' && current.status !== 'error') return { ok: false, code: 'NoActiveWorkout' };
      if (!confirmed || current.confirmation !== 'complete') {
        if (!confirmed && current.confirmation === 'complete') state.transition({ type: 'KEEP_EDITING' });
        return { ok: false, code: 'NotConfirmed' };
      }
      const validated = validateWorkoutForCompletion(current.draft);
      if (!validated.ok) {
        state.transition({ type: 'REQUEST_COMPLETE' });
        return { ok: false, code: 'ValidationError', field: validated.field, reason: validated.code };
      }
      inFlight = true;
      try {
        let attemptId = '';
        let completedAt = '';
        try { attemptId = newAttemptId(); } catch { /* Reducer supplies the safe validation reason. */ }
        if (typeof attemptId !== 'string' || !attemptId.trim() || usedAttempts.has(attemptId)) attemptId = '';
        if (attemptId) {
          usedAttempts.add(attemptId);
          try { completedAt = now(); } catch { /* Same validation path as an invalid clock value. */ }
        }
        const saving = state.transition({ type: 'BEGIN_COMPLETION', attemptId, completedAt });
        if (saving.status !== 'completing') {
          if (saving.feedback?.code === 'ValidationError') {
            return { ok: false, code: 'ValidationError', field: saving.feedback.field, reason: saving.feedback.reason };
          }
          return { ok: false, code: 'NotConfirmed' };
        }
        let result: SaveCompletedWorkoutResult;
        try {
          result = await repository.saveCompletedWorkout(validated.value, completedAt);
        } catch {
          result = { ok: false, code: 'UnexpectedStorageError' };
        }
        const latest = state.getState();
        if (latest.status !== 'completing' || latest.attemptId !== attemptId) return { ok: false, code: 'Superseded' };
        if (result.ok && Number.isSafeInteger(result.workoutId) && result.workoutId > 0) {
          state.transition({ type: 'SAVE_SUCCEEDED', attemptId, workoutId: result.workoutId });
          return { ok: true, workoutId: result.workoutId };
        }
        state.transition({ type: 'SAVE_FAILED', attemptId });
        if (result.ok) return { ok: false, code: 'UnexpectedStorageError' };
        if (result.code === 'ValidationError') {
          return { ok: false, code: 'ValidationError', field: result.field, reason: result.reason };
        }
        return { ok: false, code: result.code };
      } finally {
        inFlight = false;
      }
    },
  };
}
