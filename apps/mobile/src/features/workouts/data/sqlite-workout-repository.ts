import { calculateDurationSeconds, summarizeWorkout } from '../domain/calculations.ts';
import { isUtcTimestamp } from '../domain/time.ts';
import { validateWorkoutForCompletion } from '../domain/validation.ts';
import { migrateDatabase } from './migrations.ts';
import type { SqliteConnection } from './sqlite-connection.ts';
import { writeTransaction } from './sqlite-transaction.ts';
import type { CompletedSet, CompletedWorkout, WorkoutHistoryRepository } from './workout-repository.ts';

function isId(value: number): boolean { return Number.isSafeInteger(value) && value > 0; }

interface DetailRow {
  id: number; started_at: string; completed_at: string; duration_seconds: number;
  exercise_id: number | null; name: string; exercise_position: number;
  set_id: number | null; set_position: number; reps: number; weight_tenths_kg: number | null;
}

function readAggregate(rows: DetailRow[]): CompletedWorkout {
  const head = rows[0];
  if (!isId(head.id) || !isUtcTimestamp(head.started_at) || !isUtcTimestamp(head.completed_at)
    || head.duration_seconds !== calculateDurationSeconds(head.started_at, head.completed_at)) {
    throw new Error('Invalid stored workout');
  }
  const exercises = new Map<number, { id: number; name: string; position: number; sets: CompletedSet[] }>();
  for (const row of rows) {
    if (row.exercise_id === null || !isId(row.exercise_id)) throw new Error('Invalid stored exercise');
    let exercise = exercises.get(row.exercise_id);
    if (!exercise) {
      exercise = { id: row.exercise_id, name: row.name, position: row.exercise_position, sets: [] };
      exercises.set(row.exercise_id, exercise);
    }
    if (row.set_id !== null) {
      if (!isId(row.set_id)) throw new Error('Invalid stored set');
      exercise.sets.push({ id: row.set_id, position: row.set_position, reps: row.reps, weightTenthsKg: row.weight_tenths_kg });
    }
  }
  const ordered = Array.from(exercises.values());
  const checked = validateWorkoutForCompletion({ startedAt: head.started_at, exercises: ordered.map(exercise => ({
    ...exercise, localKey: String(exercise.id),
    sets: exercise.sets.map(set => ({ ...set, localKey: String(set.id) })),
  })) });
  if (!checked.ok || ordered.some((exercise, index) => exercise.name !== checked.value.exercises[index].name)) {
    throw new Error('Invalid stored aggregate');
  }
  return { id: head.id, startedAt: head.started_at, completedAt: head.completed_at,
    durationSeconds: head.duration_seconds, exercises: ordered, ...summarizeWorkout({ exercises: ordered }) };
}

// Create once per app data container. The factory must return a private, fresh connection.
export function createSqliteWorkoutRepository(open: () => Promise<SqliteConnection>): WorkoutHistoryRepository {
  let connection: SqliteConnection | null = null;
  let initializing: Promise<SqliteConnection | null> | null = null;
  let closing: Promise<void> | null = null;
  let quarantined = false;
  let busy = false;

  async function discard(db: SqliteConnection) {
    if (connection === db) connection = null;
    const pending = Promise.resolve().then(() => db.closeAsync()).catch(() => {
      // Never reuse a connection whose rollback/close could not be confirmed.
      quarantined = true;
    });
    closing = pending;
    try { await pending; } finally { closing = null; }
  }

  async function ready(): Promise<SqliteConnection | null> {
    if (closing) await closing;
    if (quarantined) return null;
    if (connection) return connection;
    if (initializing) return initializing;
    const pending = (async () => {
      let candidate: SqliteConnection | null = null;
      try {
        candidate = await open();
        await migrateDatabase(candidate);
        connection = candidate;
        return candidate;
      } catch {
        if (candidate) await discard(candidate);
        return null;
      }
    })();
    initializing = pending;
    try { return await pending; } finally { initializing = null; }
  }

  return {
    async deleteCompletedWorkout(id, confirmed) {
      // Check consent and ID before opening SQLite, even if another operation is busy.
      if (confirmed !== true) return { ok: false, code: 'NotConfirmed' };
      if (!isId(id)) return { ok: false, code: 'NotFound' };
      if (busy) return { ok: false, code: 'Busy' };
      busy = true;
      let db: SqliteConnection | null = null;
      try {
        db = await ready();
        if (!db) return { ok: false, code: 'StorageUnavailable' };
        const writer = db;
        const deleted = await writeTransaction(writer, async () => {
          const result = await writer.runAsync('DELETE FROM workouts WHERE id = ?', [id]);
          if (result.changes !== 0 && result.changes !== 1) throw new Error('Unexpected delete count');
          return result.changes === 1;
        });
        return deleted ? { ok: true } : { ok: false, code: 'NotFound' };
      } catch {
        if (db) await discard(db);
        return { ok: false, code: 'UnexpectedStorageError' };
      } finally { busy = false; }
    },
    async listCompletedWorkouts() {
      if (busy) return { ok: false, code: 'Busy' };
      busy = true;
      let db: SqliteConnection | null = null;
      try {
        db = await ready();
        if (!db) return { ok: false, code: 'StorageUnavailable' };
        const rows = await db.getAllAsync<{ id: number; started_at: string; completed_at: string;
          duration_seconds: number; exercise_count: number; set_count: number }>(`
          SELECT w.*, COUNT(DISTINCT e.id) AS exercise_count, COUNT(s.id) AS set_count
          FROM workouts w LEFT JOIN exercises e ON e.workout_id=w.id
          LEFT JOIN sets s ON s.exercise_id=e.id GROUP BY w.id ORDER BY w.completed_at DESC, w.id DESC`);
        const workouts = rows.map(row => {
          if (!isId(row.id) || !isUtcTimestamp(row.started_at) || !isUtcTimestamp(row.completed_at)
            || row.duration_seconds !== calculateDurationSeconds(row.started_at, row.completed_at)
            || !isId(row.exercise_count) || !isId(row.set_count)) throw new Error('Invalid stored summary');
          return { id: row.id, startedAt: row.started_at, completedAt: row.completed_at,
            durationSeconds: row.duration_seconds, exerciseCount: row.exercise_count, setCount: row.set_count };
        });
        return { ok: true, workouts };
      } catch {
        if (db) await discard(db);
        return { ok: false, code: 'UnexpectedStorageError' };
      } finally { busy = false; }
    },
    async initialize() { return await ready() ? { ok: true } : { ok: false, code: 'StorageUnavailable' }; },
    async saveCompletedWorkout(draft, completedAt) {
      if (busy) return { ok: false, code: 'Busy' };
      // Capture a normalized copy before the first await; callers cannot mutate an in-flight save.
      const checked = validateWorkoutForCompletion(draft);
      if (!checked.ok) return { ok: false, code: 'ValidationError', field: checked.field, reason: checked.code };
      if (!isUtcTimestamp(completedAt)) {
        return { ok: false, code: 'ValidationError', field: 'completedAt', reason: 'InvalidCompletedAt' };
      }
      busy = true;
      let db: SqliteConnection | null = null;
      try {
        db = await ready();
        if (!db) return { ok: false, code: 'StorageUnavailable' };
        const writer = db;
        const workoutId = await writeTransaction(writer, async () => {
          const workout = await writer.runAsync(
            'INSERT INTO workouts (started_at, completed_at, duration_seconds) VALUES (?, ?, ?)',
            [checked.value.startedAt, completedAt, calculateDurationSeconds(checked.value.startedAt, completedAt)],
          );
          if (!isId(workout.lastInsertRowId)) throw new Error('Invalid inserted ID');
          for (const exercise of checked.value.exercises) {
            const inserted = await writer.runAsync('INSERT INTO exercises (workout_id, name, position) VALUES (?, ?, ?)',
              [workout.lastInsertRowId, exercise.name, exercise.position]);
            if (!isId(inserted.lastInsertRowId)) throw new Error('Invalid inserted ID');
            for (const set of exercise.sets) {
              await writer.runAsync('INSERT INTO sets (exercise_id, position, reps, weight_tenths_kg) VALUES (?, ?, ?, ?)',
                [inserted.lastInsertRowId, set.position, set.reps, set.weightTenthsKg]);
            }
          }
          return workout.lastInsertRowId;
        });
        return { ok: true, workoutId };
      } catch {
        if (db) await discard(db);
        return { ok: false, code: 'UnexpectedStorageError' };
      } finally { busy = false; }
    },
    async getCompletedWorkout(id) {
      if (!isId(id)) return { ok: false, code: 'NotFound' };
      if (busy) return { ok: false, code: 'Busy' };
      busy = true;
      let db: SqliteConnection | null = null;
      try {
        db = await ready();
        if (!db) return { ok: false, code: 'StorageUnavailable' };
        // One SELECT gives a consistent snapshot, including exercises with no sets.
        const rows = await db.getAllAsync<DetailRow>(`SELECT w.id, w.started_at, w.completed_at, w.duration_seconds,
          e.id AS exercise_id, e.name, e.position AS exercise_position,
          s.id AS set_id, s.position AS set_position, s.reps, s.weight_tenths_kg
          FROM workouts w LEFT JOIN exercises e ON e.workout_id = w.id
          LEFT JOIN sets s ON s.exercise_id = e.id WHERE w.id = ? ORDER BY e.position, s.position`, [id]);
        if (rows.length === 0) return { ok: false, code: 'NotFound' };
        return { ok: true, workout: readAggregate(rows) };
      } catch {
        if (db) await discard(db);
        return { ok: false, code: 'UnexpectedStorageError' };
      } finally { busy = false; }
    },
  };
}
