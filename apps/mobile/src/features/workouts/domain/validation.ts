import type { DraftExercise, DraftSet, ValidationCode, ValidationResult, WorkoutDraft } from './types.ts';
import { isUtcTimestamp } from './time.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function invalid(field: string, code: ValidationCode): ValidationResult<never> {
  return { ok: false, field, code };
}

export function validateWorkoutForCompletion(input: unknown): ValidationResult<WorkoutDraft> {
  if (!isRecord(input) || !Array.isArray(input.exercises)) {
    return invalid('exercises', 'InvalidWorkout');
  }
  if (!isUtcTimestamp(input.startedAt)) {
    return invalid('startedAt', 'InvalidStartedAt');
  }
  const exercises: DraftExercise[] = [];
  const exerciseKeys = new Set<string>();
  let setCount = 0;
  for (const [index, exercise] of input.exercises.entries()) {
    const path = `exercises.${index}`;
    if (!isRecord(exercise) || !Array.isArray(exercise.sets)) return invalid(path, 'InvalidExercise');
    if (typeof exercise.localKey !== 'string' || !exercise.localKey.trim() || exerciseKeys.has(exercise.localKey)) {
      return invalid(`${path}.localKey`, 'InvalidExerciseKey');
    }
    exerciseKeys.add(exercise.localKey);
    if (exercise.position !== index) return invalid(`${path}.position`, 'InvalidExercisePosition');
    const name = parseExerciseName(exercise.name);
    if (!name.ok) return invalid(`${path}.name`, name.code);
    const sets: DraftSet[] = [];
    const setKeys = new Set<string>();
    for (const [setIndex, set] of exercise.sets.entries()) {
      const setPath = `${path}.sets.${setIndex}`;
      if (!isRecord(set)) return invalid(setPath, 'InvalidSet');
      if (typeof set.localKey !== 'string' || !set.localKey.trim() || setKeys.has(set.localKey)) {
        return invalid(`${setPath}.localKey`, 'InvalidSetKey');
      }
      setKeys.add(set.localKey);
      if (set.position !== setIndex) return invalid(`${setPath}.position`, 'InvalidSetPosition');
      if (typeof set.reps !== 'number' || !parseReps(set.reps).ok) {
        return invalid(`${setPath}.reps`, 'InvalidReps');
      }
      const weight = set.weightTenthsKg;
      if (weight !== null && (typeof weight !== 'number' || !Number.isInteger(weight) || weight < 1 || weight > 10000)) {
        return invalid(`${setPath}.weightTenthsKg`, 'InvalidWeight');
      }
      sets.push({ localKey: set.localKey, position: setIndex, reps: set.reps, weightTenthsKg: weight });
    }
    setCount += sets.length;
    exercises.push({ localKey: exercise.localKey, name: name.value, position: index, sets });
  }
  if (setCount === 0) return invalid('exercises', 'EmptyWorkout');
  return { ok: true, value: { startedAt: input.startedAt, exercises } };
}

export function parseExerciseName(input: unknown): ValidationResult<string> {
  if (typeof input === 'string') {
    const value = input.trim();
    const length = Array.from(value).length;
    if (length >= 1 && length <= 80) return { ok: true, value };
  }
  return { ok: false, field: 'name', code: 'InvalidExerciseName' };
}

export function parseReps(input: unknown): ValidationResult<number> {
  const value = typeof input === 'number' ? input
    : typeof input === 'string' && /^\d+$/.test(input.trim()) ? Number(input.trim()) : NaN;
  if (Number.isInteger(value) && value >= 1 && value <= 999) return { ok: true, value };
  return { ok: false, field: 'reps', code: 'InvalidReps' };
}

export function parseWeightKg(input: unknown): ValidationResult<number | null> {
  if (input == null || (typeof input === 'string' && input.trim() === '')) {
    return { ok: true, value: null };
  }
  const value = typeof input === 'number' ? input
    : typeof input === 'string' && /^(?:\d+(?:\.\d)?|\.\d)$/.test(input.trim()) ? Number(input.trim()) : NaN;
  const tenths = Math.round(value * 10);
  if (Number.isFinite(value) && value > 0 && value <= 1000 && tenths / 10 === value) {
    return { ok: true, value: tenths };
  }
  return {
    ok: false,
    field: 'weightKg',
    code: 'InvalidWeight',
  };
}
