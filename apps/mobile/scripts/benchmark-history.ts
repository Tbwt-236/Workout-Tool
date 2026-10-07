import assert from 'node:assert/strict';
import { arch, platform, release } from 'node:os';
import { performance } from 'node:perf_hooks';
import { sqliteFixture } from '../__tests__/support/sqlite.ts';
import { createSqliteWorkoutRepository } from '../src/features/workouts/data/sqlite-workout-repository.ts';
import { buildHistoryCalendar } from '../src/features/workouts/application/history-calendar.ts';
import type { WorkoutDraft } from '../src/features/workouts/domain/types.ts';

// Disposable synthetic database only. Never open the application's fitquest.db.
const fixture = sqliteFixture();
const count = 1000, repetitions = 25;
const timings: Record<string, number[]> = {};
async function measure<T>(name: string, operation: () => T | Promise<T>): Promise<T> {
  const started = performance.now();
  const result = await operation();
  (timings[name] ??= []).push(performance.now() - started);
  return result;
}
function synthetic(index: number): { draft: WorkoutDraft; completedAt: string } {
  const started = Date.UTC(2024, 0, 1, Math.floor(index / 4) * 24 + index % 4 * 2);
  return {
    completedAt: new Date(started + 3600000).toISOString(),
    draft: { startedAt: new Date(started).toISOString(), exercises: Array.from({ length: 4 }, (_, exercise) => ({
      localKey: `exercise-${exercise}`, name: `Synthetic exercise ${exercise + 1}`, position: exercise,
      sets: Array.from({ length: 5 }, (_, set) => ({ localKey: `set-${exercise}-${set}`, position: set,
        reps: 8 + set, weightTenthsKg: set === 0 ? null : 625 })),
    })) },
  };
}

try {
  const repository = createSqliteWorkoutRepository(async () => fixture.open().connection);
  assert.deepEqual(await measure('initialize', () => repository.initialize()), { ok: true });
  const seedStart = performance.now();
  for (let i = 0; i < count; i++) {
    const data = synthetic(i);
    const saved = await repository.saveCompletedWorkout(data.draft, data.completedAt);
    assert.deepEqual(saved, { ok: true, workoutId: i + 1 });
  }
  const seedMs = performance.now() - seedStart;
  for (let i = 0; i < repetitions; i++) {
    const list = await measure('list1000', () => repository.listCompletedWorkouts());
    assert.equal(list.ok, true);
    if (!list.ok) throw new Error('Synthetic history could not be read');
    assert.equal(list.workouts.length, 1000);
    assert.equal(list.workouts[0].id, 1000);
    assert.equal(list.workouts[999].id, 1);
    assert.ok(list.workouts.every(workout => workout.exerciseCount === 4 && workout.setCount === 20 && workout.durationSeconds === 3600));
    const calendar = await measure('calendar1000', () => buildHistoryCalendar(list.workouts, {
      year: 2024, month: 1, timeZone: 'Asia/Shanghai',
    }));
    const january = calendar.cells.filter(day => day !== null);
    assert.equal(january.length, 31);
    assert.ok(january.every(day => day.workouts.length === 4));
    assert.deepEqual(january[0].workouts.map(workout => workout.id), [4, 3, 2, 1]);
    const detail = await measure('detail20Sets', () => repository.getCompletedWorkout(500));
    assert.equal(detail.ok, true);
    if (!detail.ok) throw new Error('Synthetic detail could not be read');
    assert.equal(detail.workout.exercises.length, 4);
    assert.equal(detail.workout.exercises[3].sets[4].reps, 12);
    assert.equal(detail.workout.exercises[0].sets[0].weightTenthsKg, null);
    assert.equal(detail.workout.exercises[0].sets[1].weightTenthsKg, 625);
    const data = synthetic(count);
    const saved = await measure('save20Sets', () => repository.saveCompletedWorkout(data.draft, data.completedAt));
    assert.deepEqual(saved, { ok: true, workoutId: 1001 });
    assert.deepEqual(await measure('delete20Sets', () => repository.deleteCompletedWorkout(1001, true)), { ok: true });
  }
  for (let i = 0; i < 5; i++) {
    const result = await measure('openListClose1000', async () => {
      const connection = fixture.open().connection;
      try {
        const reopened = createSqliteWorkoutRepository(async () => connection);
        return await reopened.listCompletedWorkouts();
      } finally { await connection.closeAsync(); }
    });
    assert.ok(result.ok && result.workouts.length === 1000);
  }
  const probe = fixture.open();
  const totals = {
    workouts: Number(probe.raw.prepare('SELECT COUNT(*) AS n FROM workouts').get()!.n),
    exercises: Number(probe.raw.prepare('SELECT COUNT(*) AS n FROM exercises').get()!.n),
    sets: Number(probe.raw.prepare('SELECT COUNT(*) AS n FROM sets').get()!.n),
  };
  assert.deepEqual(totals, { workouts: 1000, exercises: 4000, sets: 20000 });
  const statistics = Object.fromEntries(Object.entries(timings).map(([name, values]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const round = (value: number) => Math.round(value * 1000) / 1000;
    return [name, { samples: values.length, medianMs: round(sorted[Math.floor(sorted.length / 2)]),
      p95Ms: round(sorted[Math.ceil(sorted.length * 0.95) - 1]), maxMs: round(sorted.at(-1)!) }];
  }));
  console.log(JSON.stringify({ schemaVersion: 1, scope: 'desktop-node-sqlite-only',
    recordedAt: new Date().toISOString(), host: { platform: platform(), release: release(), arch: arch(), node: process.version },
    synthetic: true, totals, seedMs: Math.round(seedMs), statistics,
    limitations: ['Not Expo native bridge or Hermes', 'No rendering, touch, screen-reader or phone performance measurement',
      'New connection lifecycle is measured in a warm process; the original connection remains open',
      'No timing pass/fail threshold; inspect raw evidence before optimization'],
  }, null, 2));
} finally { fixture.dispose(); }
