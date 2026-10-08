import type { ValidationCode, WorkoutDraft } from '../domain/types.ts';

export type SaveCompletedWorkoutResult =
  | { readonly ok: true; readonly workoutId: number }
  | { readonly ok: false; readonly code: 'Busy' | 'StorageUnavailable' | 'UnexpectedStorageError' }
  | { readonly ok: false; readonly code: 'ValidationError'; readonly field: string; readonly reason: ValidationCode };

export interface WorkoutSaveRepository {
  // Success means committed; failure/throw must mean no committed workout remains.
  saveCompletedWorkout(draft: WorkoutDraft, completedAt: string): Promise<SaveCompletedWorkoutResult>;
}

export interface CompletedSet {
  readonly id: number;
  readonly position: number;
  readonly reps: number;
  readonly weightTenthsKg: number | null;
}

export interface CompletedExercise {
  readonly id: number;
  readonly name: string;
  readonly position: number;
  readonly sets: readonly CompletedSet[];
}

export interface CompletedWorkout {
  readonly id: number;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationSeconds: number;
  readonly exerciseCount: number;
  readonly setCount: number;
  readonly exercises: readonly CompletedExercise[];
}

export type InitializeResult = { readonly ok: true } | { readonly ok: false; readonly code: 'StorageUnavailable' };
export type GetCompletedWorkoutResult =
  | { readonly ok: true; readonly workout: CompletedWorkout }
  | { readonly ok: false; readonly code: 'NotFound' | 'Busy' | 'StorageUnavailable' | 'UnexpectedStorageError' };

// US1 storage port; read/history extensions add their own capabilities.
export interface WorkoutRepository extends WorkoutSaveRepository {
  initialize(): Promise<InitializeResult>;
  getCompletedWorkout(id: number): Promise<GetCompletedWorkoutResult>;
}

export type CompletedWorkoutSummary = Omit<CompletedWorkout, 'exercises'>;
export type ListCompletedWorkoutsResult =
  | { readonly ok: true; readonly workouts: readonly CompletedWorkoutSummary[] }
  | { readonly ok: false; readonly code: 'Busy' | 'StorageUnavailable' | 'UnexpectedStorageError' };
export type DeleteCompletedWorkoutResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly code: 'NotConfirmed' | 'NotFound' | 'Busy' | 'StorageUnavailable' | 'UnexpectedStorageError' };

// Read and mutation capabilities stay explicit for consumers.
export interface WorkoutReadRepository extends WorkoutRepository {
  listCompletedWorkouts(): Promise<ListCompletedWorkoutsResult>;
}
export interface WorkoutHistoryRepository extends WorkoutReadRepository {
  // Without confirmed === true, no database access occurs. Success means committed.
  deleteCompletedWorkout(id: number, confirmed: boolean): Promise<DeleteCompletedWorkoutResult>;
}
