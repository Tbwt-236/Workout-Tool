import type { WorkoutExportSnapshot } from '../../workouts/data/workout-repository';
import { validateWorkoutForCompletion } from '../../workouts/domain/validation';
import { calculateDurationSeconds, summarizeWorkout } from '../../workouts/domain/calculations';
import { isUtcTimestamp } from '../../workouts/domain/time';

export function encodeExportDocument(snapshot: WorkoutExportSnapshot, exportedAt: string): string {
  if (!isUtcTimestamp(snapshot.snapshotAt) || !isUtcTimestamp(exportedAt)) throw new Error('Invalid export time');
  const workouts = snapshot.workouts.map(workout => {
    const draft = { startedAt: workout.startedAt, exercises: workout.exercises.map((exercise, index) => ({
      ...exercise, localKey: String(index), sets: exercise.sets.map((set, setIndex) => ({ ...set, localKey: String(setIndex) })),
    })) };
    const valid = validateWorkoutForCompletion(draft), summary = summarizeWorkout(draft);
    if (!valid.ok || !isUtcTimestamp(workout.completedAt)
      || workout.durationSeconds !== calculateDurationSeconds(workout.startedAt, workout.completedAt)
      || workout.exerciseCount !== summary.exerciseCount || workout.setCount !== summary.setCount
      || workout.exercises.some((e, i) => e.name !== valid.value.exercises[i].name)) throw new Error('Invalid export workout');
    return { startedAt: workout.startedAt, completedAt: workout.completedAt, durationSeconds: workout.durationSeconds,
      exercises: workout.exercises.map(e => ({ name: e.name, position: e.position,
        sets: e.sets.map(s => ({ position: s.position, reps: s.reps, weightTenthsKg: s.weightTenthsKg })) })) };
  });
  return JSON.stringify({ format: 'fitquest-workouts', schemaVersion: 1, exportedAt, snapshotAt: snapshot.snapshotAt,
    weightUnit: 'tenths_of_kg', workouts }, null, 2);
}
