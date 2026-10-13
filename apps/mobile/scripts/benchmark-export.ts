import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, renameSync, statSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { arch, platform, release, tmpdir } from 'node:os';
import { performance } from 'node:perf_hooks';
import { registerHooks } from 'node:module';
import { sqliteFixture } from '../__tests__/support/sqlite.ts';
import { createSqliteWorkoutRepository } from '../src/features/workouts/data/sqlite-workout-repository.ts';

// Benchmark-only Node resolution for the app's Metro-style relative imports.
// Import/setup finishes before timing; production code and APK remain unchanged.
const sourceRoot = new URL('../src/', import.meta.url).href;
const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  if (context.parentURL?.startsWith(sourceRoot) && specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
    return nextResolve(specifier + '.ts', context);
  }
  return nextResolve(specifier, context);
} });
const { encodeExportDocument } = await import('../src/features/data-control/domain/export-document.ts');
hook.deregister();

const fixture = sqliteFixture();
let directory: string | undefined;
const count = 1000, repetitions = 25;
const exportedAt = '2026-10-13T00:00:00.000Z';
const samples: { snapshotMs: number; encodeDocumentMs: number; nodeFileGenerateMs: number; totalMs: number }[] = [];
const expected: { startedAt: string; completedAt: string; durationSeconds: number;
  exercises: { name: string; position: number;
    sets: { position: number; reps: number; weightTenthsKg: number | null }[] }[] }[] = [];
let bytes = 0;
try {
  directory = mkdtempSync(join(tmpdir(), 'fitquest-export-benchmark-'));
  const repository = createSqliteWorkoutRepository(async () => fixture.open().connection);
  const initializeStart = performance.now();
  assert.deepEqual(await repository.initialize(), { ok: true });
  const initializeMs = performance.now() - initializeStart;
  const seedStart = performance.now();
  for (let i = 0; i < count; i++) {
    const startedAt = new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString();
    const completedAt = new Date(Date.UTC(2026, 0, 1, 0, i + 30)).toISOString();
    const exercises = Array.from({ length: 4 }, (_, e) => ({ name: `合成 ${i}-${e} "深蹲"`, position: e,
      sets: Array.from({ length: 5 }, (_, s) => ({ position: s, reps: s + 1, weightTenthsKg: s === 0 ? null : 625 })) }));
    expected.unshift({ startedAt, completedAt, durationSeconds: 1800, exercises });
    const result = await repository.saveCompletedWorkout({ startedAt,
      exercises: exercises.map((e, ei) => ({ ...e, localKey: String(ei),
        sets: e.sets.map((s, si) => ({ ...s, localKey: String(si) })) })) }, completedAt);
    assert.deepEqual(result, { ok: true, workoutId: i + 1 });
  }
  const seedMs = performance.now() - seedStart;
  for (let i = 0; i < repetitions; i++) {
    const start = performance.now();
    const result = await repository.readExportSnapshot();
    const snapshotEnd = performance.now();
    if (!result.ok) throw new Error('Synthetic snapshot failed: ' + result.code);
    const document = encodeExportDocument(result.snapshot, exportedAt);
    const encodeEnd = performance.now();
    const partial = join(directory, `sample-${i}.partial`), complete = join(directory, `sample-${i}.json`);
    writeFileSync(partial, document, { encoding: 'utf8', flag: 'wx' });
    renameSync(partial, complete);
    const size = statSync(complete).size;
    const end = performance.now();
    samples.push({ snapshotMs: snapshotEnd - start, encodeDocumentMs: encodeEnd - snapshotEnd,
      nodeFileGenerateMs: end - encodeEnd, totalMs: end - start });
    // Integrity checks and cleanup are outside the timed interval.
    bytes = Buffer.byteLength(document, 'utf8'); assert.equal(size, bytes);
    const parsed = JSON.parse(readFileSync(complete, 'utf8'));
    assert.deepEqual(parsed, { format: 'fitquest-workouts', schemaVersion: 1, exportedAt,
      snapshotAt: result.snapshot.snapshotAt, weightUnit: 'tenths_of_kg', workouts: expected });
    assert.equal(parsed.workouts.flatMap((w: { exercises: object[] }) => w.exercises).length, 4000);
    assert.equal(parsed.workouts.flatMap((w: { exercises: { sets: object[] }[] }) => w.exercises.flatMap(e => e.sets)).length, 20000);
    rmSync(complete);
  }
  const fields = ['snapshotMs', 'encodeDocumentMs', 'nodeFileGenerateMs', 'totalMs'] as const;
  const statistics = Object.fromEntries(fields.map(field => {
    const sorted = samples.map(s => s[field]).sort((a, b) => a - b);
    return [field, { median: sorted[Math.floor(sorted.length / 2)], p95: sorted[Math.ceil(sorted.length * .95) - 1], max: sorted.at(-1) }];
  }));
  console.log(JSON.stringify({ schemaVersion: 1, recordedAt: new Date().toISOString(),
    scope: 'desktop-node-sqlite-and-node-file-io-only', synthetic: true,
    host: { platform: platform(), release: release(), arch: arch(), node: process.version },
    totals: { workouts: 1000, exercises: 4000, sets: 20000 }, repetitions,
    initializeMs, seedMs, utf8Bytes: bytes, statistics, samples,
    limitations: ['Warm process and database cache; first sample is not cold-start',
      'Production repository and encoder, but Node file I/O replaces Expo native files',
      'No fsync or durable-storage guarantee; file timing covers UTF-8 write, close, rename and stat',
      'No cleanup, sharing-availability check, system chooser, receiver or rendering timing',
      'No phone performance claim or pass/fail speed threshold; no samples discarded'],
  }, null, 2));
} finally {
  try { fixture.dispose(); } finally { if (directory) rmSync(directory, { recursive: true, force: true }); }
}
