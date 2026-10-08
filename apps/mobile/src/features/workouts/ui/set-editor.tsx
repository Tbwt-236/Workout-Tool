import { useEffect, useRef, useState } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';
import { useWorkout, type SetFields } from '../application/workout-provider';
import type { DraftExercise } from '../domain/types';
import { parseReps, parseWeightKg } from '../domain/validation';
import { feedbackMessage, getWorkoutCopy } from '../../../i18n/workout-copy';
import { Action, styles } from './primitives';
export function suggested(exercise: DraftExercise): SetFields {
  const last = exercise.sets.at(-1);
  return { reps: last ? String(last.reps) : '', weight: last?.weightTenthsKg == null ? '' : String(last.weightTenthsKg / 10), dirty: false };
}
export function SetEditor({ exercise, editing = false, focusRequest = 0, onLocate, onFocusHandled }:
  { exercise: DraftExercise; editing?: boolean; focusRequest?: number; onLocate?: (view: View) => void; onFocusHandled?: () => void }) {
  const { state, locale, editor, setEditor, transition, nextKey } = useWorkout();
  const copy = getWorkoutCopy(locale);
  const current = editing ? editor.editing! : editor.fields[exercise.localKey] ?? suggested(exercise);
  const reps = parseReps(current.reps), weight = parseWeightKg(current.weight);
  const repsError = current.validationRequested && !reps.ok
    ? feedbackMessage(locale, { code: 'ValidationError', field: reps.field, reason: reps.code }) : '';
  const weightError = current.validationRequested && !weight.ok
    ? feedbackMessage(locale, { code: 'ValidationError', field: weight.field, reason: weight.code }) : '';
  const weightRef = useRef<TextInput>(null), repsRef = useRef<TextInput>(null);
  const rowRef = useRef<View>(null);
  useEffect(() => {
    if (!focusRequest) return;
    const frame = requestAnimationFrame(() => {
      if (rowRef.current) onLocate?.(rowRef.current);
      repsRef.current?.focus();
      onFocusHandled?.();
    });
    return () => cancelAnimationFrame(frame);
  }, [focusRequest, onLocate, onFocusHandled]);
  const lastLog = useRef(-Infinity);
  const [cooling, setCooling] = useState(false);
  useEffect(() => {
    if (!cooling) return;
    const timer = setTimeout(() => setCooling(false), 650);
    return () => clearTimeout(timer);
  }, [cooling]);
  const disabled = state.status === 'completing' || !!editor.name;
  function change(field: 'reps' | 'weight', value: string) {
    setEditor(old => editing ? { ...old, editing: old.editing && { ...old.editing, [field]: value } }
      : { ...old, fields: { ...old.fields, [exercise.localKey]: { ...current, [field]: value, dirty: true } } });
  }
  function submit() {
    if (disabled || (!editing && performance.now() - lastLog.current < 650)) return;
    const next = transition(editing && editor.editing
      ? { type: 'UPDATE_SET', exerciseKey: exercise.localKey, setKey: editor.editing.setKey, reps: current.reps, weightKg: current.weight }
      : { type: 'ADD_SET', exerciseKey: exercise.localKey, key: nextKey(), reps: current.reps, weightKg: current.weight });
    if (next.feedback) {
      setEditor(old => editing ? { ...old, editing: old.editing && { ...old.editing, validationRequested: true } }
        : { ...old, fields: { ...old.fields, [exercise.localKey]: { reps: current.reps, weight: current.weight,
          dirty: old.fields[exercise.localKey]?.dirty ?? false, validationRequested: true } } });
      // Keep the input and its error together above the keyboard on long workouts.
      if (rowRef.current) onLocate?.(rowRef.current);
      if (!parseReps(current.reps).ok) repsRef.current?.focus();
      else if (!parseWeightKg(current.weight).ok) weightRef.current?.focus();
      return;
    }
    if (!editing) { lastLog.current = performance.now(); setCooling(true); }
    setEditor(old => {
      const fields = { ...old.fields };
      if (!editing) fields[exercise.localKey] = { reps: current.reps, weight: current.weight, dirty: false };
      else if (!fields[exercise.localKey]?.dirty && 'draft' in next) {
        fields[exercise.localKey] = suggested(next.draft.exercises.find(e => e.localKey === exercise.localKey)!);
      }
      return { ...old, fields, editing: null };
    });
    Keyboard.dismiss();
  }
  return <View ref={rowRef} style={styles.inputTray}>
    <View style={[styles.row, { alignItems: 'flex-end' }]}>
    <View style={styles.inputColumn}>
    <Text style={styles.inputLabel}>kg</Text>
    <TextInput ref={weightRef} accessibilityLabel={exercise.name + ' ' + copy.weight} accessibilityHint={weightError || copy.optionalWeight}
      style={[styles.field, styles.numericField, !!weightError && styles.invalidField]} value={current.weight} onChangeText={value => change('weight', value)} editable={!disabled}
      keyboardType="decimal-pad" returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => repsRef.current?.focus()} placeholder="kg" />
    </View>
    <View style={styles.inputColumn}>
    <Text style={styles.inputLabel}>{copy.reps}</Text>
    <TextInput ref={repsRef} accessibilityLabel={exercise.name + ' ' + copy.reps} accessibilityHint={repsError || undefined}
      style={[styles.field, styles.numericField, !!repsError && styles.invalidField]}
      value={current.reps} onChangeText={value => change('reps', value)} editable={!disabled}
      keyboardType="number-pad" returnKeyType="done" submitBehavior="submit" onSubmitEditing={submit} placeholder={copy.reps} />
    </View>
    <Action primary label={exercise.name + ' ' + (editing ? copy.save : copy.log)} disabled={disabled || cooling} onPress={submit}>{editing ? copy.save : copy.log}</Action>
    </View>
    {!!repsError && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{repsError}</Text>}
    {!!weightError && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{weightError}</Text>}
  </View>;
}
