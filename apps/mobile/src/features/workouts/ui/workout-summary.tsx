import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useWorkout } from '../application/workout-provider';
import type { GetCompletedWorkoutResult } from '../data/workout-repository';
import { formatCount, getWorkoutCopy } from '../../../i18n/workout-copy';
import { Action, Confirmation, styles } from './primitives';
import { LanguageSwitch } from './workout-screen';
interface SummaryProps { id: number; onBack: () => void; deletable?: boolean }
export function WorkoutSummary(props: SummaryProps) {
  // A different record must never inherit an earlier record's destructive confirmation.
  return <SummaryContent key={props.id} {...props} />;
}
function SummaryContent({ id, onBack, deletable = false }: SummaryProps) {
  const { repository, locale, deleting, removeWorkout } = useWorkout();
  const [confirming, setConfirming] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);
  const confirmationConsumed = useRef(false);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const [loaded, setLoaded] = useState<{ id: number; attempt: number; result: GetCompletedWorkoutResult } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const result = loaded?.id === id && loaded.attempt === attempt ? loaded.result : null;
  useEffect(() => {
    let active = true;
    void repository.getCompletedWorkout(id).then(value => { if (active) setLoaded({ id, attempt, result: value }); },
      () => { if (active) setLoaded({ id, attempt, result: { ok: false, code: 'UnexpectedStorageError' } }); });
    return () => { active = false; };
  }, [repository, id, attempt]);
  const zh = locale === 'zh', copy = getWorkoutCopy(locale);
  async function confirmDelete() {
    if (!confirming || deleting || confirmationConsumed.current) return;
    // Consume synchronously: another press can arrive before React closes the dialog.
    confirmationConsumed.current = true;
    setConfirming(false); setDeleteFailed(false);
    const removed = await removeWorkout(id, true);
    if (!mounted.current) return;
    if (removed.ok) onBack();
    else if (removed.code === 'NotFound') setLoaded({ id, attempt, result: { ok: false, code: 'NotFound' } });
    else setDeleteFailed(true);
  }
  return <>
    <ScrollView style={styles.page} contentContainerStyle={styles.content}
      accessibilityElementsHidden={confirming} importantForAccessibility={confirming ? 'no-hide-descendants' : 'auto'}>
    <View style={styles.top}><Action disabled={deleting} onPress={onBack}>{zh ? '返回' : 'Back'}</Action><LanguageSwitch /></View>
    {!result ? <Text style={styles.muted}>{zh ? '读取中…' : 'Loading…'}</Text>
      : !result.ok ? <View style={styles.block}><Text accessibilityRole="alert" style={styles.text}>
        {result.code === 'NotFound' ? (zh ? '训练不存在' : 'Workout not found') : (zh ? '暂时无法读取训练' : 'Could not load workout')}</Text>
        {result.code !== 'NotFound' && <Action onPress={() => setAttempt(n => n + 1)}>{copy.retry}</Action>}</View>
      : <>
        <Text style={styles.muted}>{zh ? '已保存' : 'Saved'}</Text>
        <Text accessibilityRole="header" style={styles.title}>{new Date(result.workout.completedAt).toLocaleDateString(zh ? 'zh-CN' : 'en-GB', { localeMatcher: 'lookup' })}</Text>
        <Text style={styles.text}>{formatCount(locale, 'exercises', result.workout.exerciseCount)} · {formatCount(locale, 'sets', result.workout.setCount)} · {Math.floor(result.workout.durationSeconds / 60)} min</Text>
        {result.workout.exercises.map(exercise => <View style={styles.block} key={exercise.id}>
          <Text style={styles.heading}>{exercise.name}</Text>
          {exercise.sets.length === 0 && <Text style={styles.muted}>{zh ? '未录组' : 'No sets'}</Text>}
          {exercise.sets.map(set => <View style={styles.top} key={set.id}><Text style={styles.muted}>{set.position + 1}</Text>
            <Text style={styles.text}>{set.weightTenthsKg === null ? '—' : set.weightTenthsKg / 10 + ' kg'} × {set.reps}</Text></View>)}
        </View>)}
        {deletable && <>
          {deleting && <Text style={styles.muted} accessibilityLiveRegion="polite">{zh ? '删除中…' : 'Deleting…'}</Text>}
          {deleteFailed && <Text style={styles.error} accessibilityRole="alert">{zh ? '尚未删除，请重试' : 'Not deleted. Retry.'}</Text>}
          <Action danger disabled={deleting} onPress={() => { confirmationConsumed.current = false; setConfirming(true); }}>{deleteFailed ? copy.retry : copy.remove}</Action>
        </>}
      </>}
    </ScrollView>
    {confirming && result?.ok && <Confirmation title={copy.confirmRemoveWorkout} onClose={() => setConfirming(false)}>
      <LanguageSwitch />
      <Text style={styles.text}>{new Date(result.workout.completedAt).toLocaleString(zh ? 'zh-CN' : 'en-GB', { localeMatcher: 'lookup' })}</Text>
      <Text style={styles.muted}>{zh ? '将删除本次训练及全部组，无法撤销。' : 'Deletes this workout and all sets. This cannot be undone.'}</Text>
      <Action onPress={() => setConfirming(false)}>{copy.cancel}</Action>
      <Action danger label={zh ? '确认删除' : 'Confirm delete'} onPress={() => { void confirmDelete(); }}>{copy.remove}</Action>
    </Confirmation>}
  </>;
}
