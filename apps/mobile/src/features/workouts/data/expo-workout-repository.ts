import { openDatabaseAsync } from 'expo-sqlite';
import { createSqliteWorkoutRepository } from './sqlite-workout-repository.ts';
import type { WorkoutHistoryRepository } from './workout-repository.ts';

// One private repository per application provider lifecycle.
export function createExpoWorkoutRepository(): WorkoutHistoryRepository {
  return createSqliteWorkoutRepository(() => openDatabaseAsync('fitquest.db', { useNewConnection: true }));
}
