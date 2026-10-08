import { isUtcTimestamp } from './time.ts';

export function summarizeWorkout(workout: { readonly exercises: readonly { readonly sets: readonly unknown[] }[] }) {
  return {
    exerciseCount: workout.exercises.length,
    setCount: workout.exercises.reduce((count, exercise) => count + exercise.sets.length, 0),
  };
}

export function calculateDurationSeconds(startedAt: string, completedAt: string): number {
  if (!isUtcTimestamp(startedAt) || !isUtcTimestamp(completedAt)) throw new RangeError('训练时间无效');
  const start = Date.parse(startedAt);
  const end = Date.parse(completedAt);
  return Math.max(0, Math.floor((end - start) / 1000));
}
