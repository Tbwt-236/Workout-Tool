import type { SqliteConnection } from './sqlite-connection.ts';
import { writeTransaction } from './sqlite-transaction.ts';

const schemaV1 = `
  CREATE TABLE workouts (
    id INTEGER PRIMARY KEY CHECK (id > 0 AND id <= 9007199254740991),
    started_at TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL CHECK (typeof(duration_seconds) = 'integer' AND duration_seconds >= 0)
  );
  CREATE TABLE exercises (
    id INTEGER PRIMARY KEY CHECK (id > 0 AND id <= 9007199254740991),
    workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (name = trim(name) AND length(name) BETWEEN 1 AND 80),
    position INTEGER NOT NULL CHECK (typeof(position) = 'integer' AND position >= 0),
    UNIQUE (workout_id, position)
  );
  CREATE TABLE sets (
    id INTEGER PRIMARY KEY CHECK (id > 0 AND id <= 9007199254740991),
    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (typeof(position) = 'integer' AND position >= 0),
    reps INTEGER NOT NULL CHECK (typeof(reps) = 'integer' AND reps BETWEEN 1 AND 999),
    weight_tenths_kg INTEGER CHECK (weight_tenths_kg IS NULL OR
      (typeof(weight_tenths_kg) = 'integer' AND weight_tenths_kg BETWEEN 1 AND 10000)),
    UNIQUE (exercise_id, position)
  );
  CREATE INDEX workouts_completed_at ON workouts (completed_at DESC);
  PRAGMA user_version = 1;
`;

// Internal API: failures throw; the owning repository converts them to safe error codes.
export async function migrateDatabase(db: SqliteConnection): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON');
  const [foreignKeys] = await db.getAllAsync<{ foreign_keys: number }>('PRAGMA foreign_keys');
  const [journal] = await db.getAllAsync<{ journal_mode: string }>('PRAGMA journal_mode = WAL');
  if (foreignKeys?.foreign_keys !== 1 || journal?.journal_mode !== 'wal') {
    throw new Error('Required database settings are unavailable');
  }
  await writeTransaction(db, async () => {
    const [row] = await db.getAllAsync<{ user_version: number }>('PRAGMA user_version');
    if (row?.user_version === 0) await db.execAsync(schemaV1);
    else if (row?.user_version !== 1) throw new Error('Unsupported database version');
    // A version number alone is insufficient evidence that the schema is usable.
    await db.getAllAsync(`SELECT w.id, w.started_at, w.completed_at, w.duration_seconds,
      e.id, e.workout_id, e.name, e.position, s.id, s.exercise_id, s.position, s.reps, s.weight_tenths_kg
      FROM workouts w LEFT JOIN exercises e ON e.workout_id = w.id
      LEFT JOIN sets s ON s.exercise_id = e.id LIMIT 0`);
  });
}
