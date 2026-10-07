import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useWorkout } from '../application/workout-provider';
import { feedbackMessage, formatCount, getWorkoutCopy } from '../../../i18n/workout-copy';
import { Action, Confirmation, PageHeading, styles } from './primitives';
import { SetEditor, suggested } from './set-editor';
import { parseExerciseName } from '../domain/validation';
export function LanguageSwitch() {
  const { locale, setLocale } = useWorkout();
  return <Action onPress={() => setLocale(locale === 'zh' ? 'en' : 'zh')}>{locale === 'zh' ? 'EN' : '中文'}</Action>;
}
export function WorkoutScreen({ onSaved, keyboardVerticalOffset = 0 }:
  { onSaved: (id: number) => void; keyboardVerticalOffset?: number }) {
  const app = useWorkout();
  const { state, locale, editor, setEditor, transition } = app;
  const copy = getWorkoutCopy(locale), zh = locale === 'zh';
  const [prompt, setPrompt] = useState<'unsaved' | 'remove' | null>(null);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const [focusRequest, setFocusRequest] = useState({ exerciseKey: '', sequence: 0 });
  const clearInputFocus = useCallback(() => setFocusRequest(old => ({ ...old, exerciseKey: '' })), []);
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const pendingLocation = useRef<View | null>(null);
  const scrollToInput = useCallback((view: View) => {
    const scroll = scrollRef.current;
    const content = contentRef.current;
    if (!scroll || !content) return;
    view.measureLayout(content, (_x, y) => {
      scroll.scrollTo({ y: Math.max(0, y - 24), animated: false });
    }, () => {});
  }, []);
  const locateInput = useCallback((view: View) => {
    pendingLocation.current = view;
    scrollToInput(view);
  }, [scrollToInput]);
  const locateAfterResize = useCallback(() => {
    const view = pendingLocation.current;
    pendingLocation.current = null;
    // Focus can reopen the keyboard after the first scroll used its hidden height.
    if (view && Keyboard.isVisible()) scrollToInput(view);
  }, [scrollToInput]);
  const saving = state.status === 'completing';
  const draft = 'draft' in state ? state.draft : null;
  const confirmation = 'confirmation' in state ? state.confirmation : null;
  const dirty = !!editor.editing || Object.values(editor.fields).some(field => field.dirty);
  // Input errors live with their owning editor; this also removes stale feedback after correction/cancel.
  const inputFeedback = state.feedback?.code === 'ValidationError'
    && ['InvalidReps', 'InvalidWeight', 'InvalidExerciseName'].includes(state.feedback.reason);
  const error = inputFeedback ? '' : feedbackMessage(locale, state.feedback);
  const checkedName = editor.name ? parseExerciseName(editor.name.value) : null;
  const nameError = editor.name?.validationRequested && checkedName && !checkedName.ok
    ? feedbackMessage(locale, { code: 'ValidationError', field: checkedName.field, reason: checkedName.code }) : '';
  function finishRequest() {
    if (saving || editor.name) return;
    if (dirty) setPrompt('unsaved'); else app.service.requestCompletion();
  }
  return <KeyboardAvoidingView style={styles.page} keyboardVerticalOffset={keyboardVerticalOffset} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView ref={scrollRef} innerViewRef={contentRef as RefObject<View>} onLayout={locateAfterResize} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
      accessibilityElementsHidden={!!prompt || !!confirmation} importantForAccessibility={prompt || confirmation ? 'no-hide-descendants' : 'auto'}>
      <PageHeading title={zh ? '训练' : 'Train'}>
        <LanguageSwitch />
        {draft && <Action primary disabled={saving || !!editor.name} onPress={finishRequest}>{copy.finish}</Action>}
      </PageHeading>
      {!draft ? <View style={styles.block}><Text style={styles.heading}>{zh ? '准备好，开始练。' : 'Ready when you are.'}</Text>
        <Action primary onPress={app.start}>{copy.start}</Action></View> : <>
        <Text style={styles.muted}>{formatCount(locale, 'exercises', draft.exercises.length)} · {formatCount(locale, 'sets', draft.exercises.reduce((n, e) => n + e.sets.length, 0))}</Text>
        {!!error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
        {saving && <Text accessibilityLiveRegion="polite" style={styles.text}>{zh ? '保存中…' : 'Saving…'}</Text>}
        {state.status === 'error' && <Action disabled={!!editor.name} onPress={finishRequest}>{copy.retry}</Action>}
        {draft.exercises.map(exercise => <View key={exercise.localKey} style={styles.block}>
          <View style={styles.top}><Text style={styles.heading}>{exercise.name}</Text>
            <Action label={exercise.name + ' ' + copy.rename} disabled={saving || !!editor.editing || !!editor.name}
              onPress={() => setEditor(old => ({ ...old, name: { key: exercise.localKey, value: exercise.name } }))}>{copy.rename}</Action></View>
          {exercise.sets.map((set, index) => editor.editing?.setKey === set.localKey && editor.editing.exerciseKey === exercise.localKey
            ? <View key={set.localKey}><SetEditor exercise={exercise} editing onLocate={locateInput} onFocusHandled={clearInputFocus}
                focusRequest={focusRequest.exerciseKey === exercise.localKey ? focusRequest.sequence : 0} />
                <View style={styles.row}><Action disabled={saving} onPress={() => setPrompt('remove')}>{copy.remove}</Action>
                  <Action onPress={() => setEditor(old => ({ ...old, editing: null }))}>{copy.cancel}</Action></View></View>
            : <View key={set.localKey} style={[styles.top, styles.divider]}>
                <Text style={styles.setIndex}>{index + 1}</Text>
                <Text style={styles.numeric}>{set.weightTenthsKg === null ? '—' : set.weightTenthsKg / 10 + ' kg'} × {set.reps}</Text>
                <Action label={exercise.name + (zh ? ' 第' + (index + 1) + '组 编辑' : ' Set ' + (index + 1) + ' Edit')}
                  disabled={saving || !!editor.editing || !!editor.name} onPress={() => setEditor(old => ({ ...old,
                    editing: { exerciseKey: exercise.localKey, setKey: set.localKey, reps: String(set.reps),
                      weight: set.weightTenthsKg === null ? '' : String(set.weightTenthsKg / 10) } }))}>{copy.edit}</Action>
              </View>)}
          {!editor.editing && <SetEditor exercise={exercise} onLocate={locateInput} onFocusHandled={clearInputFocus}
            focusRequest={focusRequest.exerciseKey === exercise.localKey ? focusRequest.sequence : 0} />}
        </View>)}
        {editor.name ? <View style={styles.block}><TextInput accessibilityLabel={zh ? '动作名称' : 'Exercise name'} accessibilityHint={nameError || undefined}
          style={[styles.field, !!nameError && styles.invalidField]} value={editor.name.value} onChangeText={value => setEditor(old => ({ ...old, name: old.name && { ...old.name, value } }))}
          editable={!saving} autoFocus maxLength={160} />
          {!!nameError && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{nameError}</Text>}
          <View style={styles.row}><Action primary label={zh ? '保存动作' : 'Save exercise'} onPress={() => {
            if (!editor.name) return;
            const next = transition(editor.name.key
              ? { type: 'RENAME_EXERCISE', exerciseKey: editor.name.key, name: editor.name.value }
              : { type: 'ADD_EXERCISE', key: app.nextKey(), name: editor.name.value });
            if (!next.feedback) { setEditor(old => ({ ...old, name: null })); Keyboard.dismiss(); }
            else setEditor(old => ({ ...old, name: old.name && { ...old.name, validationRequested: true } }));
          }}>{copy.save}</Action><Action onPress={() => setEditor(old => ({ ...old, name: null }))}>{copy.cancel}</Action></View>
        </View> : <Action secondary disabled={saving || !!editor.editing} onPress={() => setEditor(old => ({ ...old, name: { key: null, value: '' } }))}>{copy.addExercise}</Action>}
        <Action quiet label={zh ? '取消训练' : 'Cancel workout'} disabled={saving} onPress={() => {
          const next = app.service.requestCancellation(dirty || !!editor.name?.value.trim());
          if (next.status === 'idle') app.resetEditor();
        }}>{zh ? '取消训练' : 'Cancel workout'}</Action>
      </>}
    </ScrollView>
    {prompt === 'unsaved' && <Confirmation immediate title={zh ? '有未记录的输入' : 'Unlogged input'} onClose={() => setPrompt(null)}>
      <Text style={styles.muted}>{zh ? '先记录，或放弃这些输入后完成。' : 'Log it first, or discard this input before finishing.'}</Text>
      <Action onPress={() => {
        const exerciseKey = editor.editing?.exerciseKey ?? draft?.exercises.find(exercise => editor.fields[exercise.localKey]?.dirty)?.localKey;
        setPrompt(null);
        if (exerciseKey) setFocusRequest(old => ({ exerciseKey, sequence: old.sequence + 1 }));
      }}>{zh ? '先记录' : 'Log first'}</Action>
      <Action danger onPress={() => { setEditor(old => ({ ...old, fields: {}, editing: null })); setPrompt(null); app.service.requestCompletion(); }}>
        {zh ? '放弃输入' : 'Discard input'}</Action>
    </Confirmation>}
    {prompt === 'remove' && <Confirmation title={copy.confirmRemoveSet} onClose={() => setPrompt(null)}>
      <Action onPress={() => setPrompt(null)}>{copy.continue}</Action>
      <Action danger label={zh ? '确认删除' : 'Confirm delete'} onPress={() => {
        if (editor.editing) {
          const exerciseKey = editor.editing.exerciseKey;
          const next = transition({ type: 'REMOVE_SET', exerciseKey, setKey: editor.editing.setKey });
          if ('draft' in next) {
            const exercise = next.draft.exercises.find(item => item.localKey === exerciseKey)!;
            setEditor(old => ({ ...old, editing: null, fields: { ...old.fields,
              [exerciseKey]: old.fields[exerciseKey]?.dirty ? old.fields[exerciseKey] : suggested(exercise) } }));
          }
        }
        setPrompt(null);
      }}>{copy.remove}</Action>
    </Confirmation>}
    {confirmation === 'complete' && <Confirmation title={copy.confirmFinish} onClose={() => { void app.service.completeWorkout(false); }}>
      <LanguageSwitch /><Action onPress={() => { void app.service.completeWorkout(false); }}>{copy.continue}</Action>
      <Action primary label={zh ? '确认完成' : 'Confirm finish'} onPress={() => { void app.finish().then(result => {
        // A native link may leave this screen while its transaction is still committing.
        if (result.ok && mounted.current) onSaved(result.workoutId);
      }); }}>{copy.finish}</Action>
    </Confirmation>}
    {confirmation === 'cancel' && <Confirmation title={copy.confirmCancel} onClose={() => { app.service.cancelWorkout(false); }}>
      <Action onPress={() => { app.service.cancelWorkout(false); }}>{copy.continue}</Action>
      <Action danger label={zh ? '确认取消' : 'Confirm cancel'} onPress={() => { app.service.cancelWorkout(true); app.resetEditor(); }}>{copy.cancel}</Action>
    </Confirmation>}
  </KeyboardAvoidingView>;
}
