export type ValidationCode =
  | 'InvalidWorkout' | 'InvalidStartedAt' | 'InvalidExercise'
  | 'InvalidExerciseKey' | 'InvalidExercisePosition' | 'InvalidExerciseName'
  | 'InvalidSet' | 'InvalidSetKey' | 'InvalidSetPosition'
  | 'InvalidReps' | 'InvalidWeight' | 'EmptyWorkout'
  | 'InvalidAttempt' | 'InvalidCompletedAt';

export type ValidationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly field: string; readonly code: ValidationCode };

export interface DraftSet {
  readonly localKey: string;
  readonly position: number;
  readonly reps: number;
  readonly weightTenthsKg: number | null;
}

export interface DraftExercise {
  readonly localKey: string;
  readonly name: string;
  readonly position: number;
  readonly sets: readonly DraftSet[];
}

// Lifecycle state belongs to the application reducer; this is its data payload.
export interface WorkoutDraft {
  readonly startedAt: string;
  readonly exercises: readonly DraftExercise[];
}
