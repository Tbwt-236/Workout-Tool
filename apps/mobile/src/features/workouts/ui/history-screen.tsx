import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useWorkout } from '../application/workout-provider';
import { buildHistoryCalendar, shiftCalendarMonth } from '../application/history-calendar';
import type { CompletedWorkoutSummary, ListCompletedWorkoutsResult } from '../data/workout-repository';
import { formatCount, getWorkoutCopy } from '../../../i18n/workout-copy';
import { LanguageSwitch } from './workout-screen';
import { Action, PageHeading, colors, styles } from './primitives';
export function HistoryScreen({ onOpen, onTrain }: { onOpen: (id: number) => void; onTrain: () => void }) {
  const app = useWorkout();
  const { repository, revision, locale, calendarDate, setCalendarDate, selectedDate, setSelectedDate } = app;
  const writePending = app.state.status === 'completing' || app.deleting;
  const reads = useRef<Promise<void>>(Promise.resolve());
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<{ revision: number; attempt: number; result: ListCompletedWorkoutsResult; workouts: readonly CompletedWorkoutSummary[] } | null>(null);
  const [timeZone, setTimeZone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const { width } = useWindowDimensions();
  useEffect(() => {
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    });
    return () => listener.remove();
  }, []);
  useEffect(() => {
    // Own writes hold the repository lock. Read once they settle, including failure.
    if (writePending) return;
    let active = true;
    const receive = (result: ListCompletedWorkoutsResult) => {
      if (active) setLoaded(old => ({ revision, attempt, result, workouts: result.ok ? result.workouts : old?.workouts ?? [] }));
    };
    // State and revision can settle in separate renders. Cleanup cannot cancel SQL;
    // let it finish, then skip obsolete requests before taking the lock again.
    const request = reads.current.then(() => active ? repository.listCompletedWorkouts() : undefined);
    reads.current = request.then(() => undefined, () => undefined);
    void request.then(result => { if (result) receive(result); }, () => receive({ ok: false, code: 'UnexpectedStorageError' }));
    return () => { active = false; };
  }, [repository, revision, attempt, writePending]);
  const result = !writePending && loaded?.revision === revision && loaded.attempt === attempt ? loaded.result : null;
  const zh = locale === 'zh', copy = getWorkoutCopy(locale);
  const year = calendarDate.getFullYear(), month = calendarDate.getMonth() + 1;
  let calendar;
  try { calendar = buildHistoryCalendar(loaded?.workouts ?? [], { year, month, timeZone }); }
  catch { calendar = null; }
  const day = calendar?.cells.find(cell => cell?.dateKey === selectedDate);
  const active = 'draft' in app.state;
  function shift(direction: 1 | -1) {
    const next = shiftCalendarMonth({ year, month }, direction);
    const date = new Date(0); date.setFullYear(next.year, next.month - 1, 1);
    setCalendarDate(date); setSelectedDate(null);
  }
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <PageHeading title={copy.history}><LanguageSwitch />
      <Action primary disabled={app.state.status === 'completing'} onPress={() => { app.start(); onTrain(); }}>{active ? copy.continue : copy.start}</Action></PageHeading>
    {active && <Text style={styles.muted}>{zh ? '训练进行中' : 'Workout in progress'}</Text>}
    <View style={styles.top}><Action label={zh ? '上月' : 'Previous month'} disabled={year === 1 && month === 1} onPress={() => shift(-1)}>‹</Action>
      <Text style={[styles.heading, historyStyles.monthHeading]}>{calendarDate.toLocaleDateString(zh ? 'zh-CN' : 'en-GB', { localeMatcher: 'lookup', year: 'numeric', month: 'long' })}</Text>
      <Action label={zh ? '下月' : 'Next month'} disabled={year === 9999 && month === 12} onPress={() => shift(1)}>›</Action></View>
    {!result && <Text style={styles.muted}>{zh ? '读取中…' : 'Loading…'}</Text>}
    {(result && !result.ok || !calendar) && <View><Text style={styles.error} accessibilityRole="alert">{zh ? '暂时无法读取历史' : 'Could not load history'}</Text>
      <Action onPress={() => setAttempt(n => n + 1)}>{copy.retry}</Action></View>}
    {calendar && <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ width: Math.max(336, width - 40) }}>
        <View style={styles.row}>{(zh ? ['一', '二', '三', '四', '五', '六', '日'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S']).map((label, i) =>
          <Text key={i} style={[styles.muted, historyStyles.weekday]}>{label}</Text>)}</View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 1, marginTop: 12 }}>
          {calendar.cells.map((cell, i) => cell ? <Pressable key={cell.dateKey} accessibilityRole="button"
            accessibilityLabel={cell.dateKey + (zh ? ' · ' + cell.workouts.length + ' 场训练' : ' · ' + cell.workouts.length + ' workouts')}
            accessibilityState={{ selected: selectedDate === cell.dateKey, disabled: !result || !result.ok }}
            disabled={!result || !result.ok}
            onPress={() => { setSelectedDate(cell.dateKey); if (cell.workouts.length === 1) onOpen(cell.workouts[0].id); }}
            style={historyStyles.dayTarget}>
            <View style={[historyStyles.dayNumber, selectedDate === cell.dateKey && { backgroundColor: colors.orange, borderColor: colors.accentText }]}>
              <Text style={styles.calendarDayText}>{cell.day}</Text>
            </View>
            <View style={[historyStyles.workoutDot, { backgroundColor: cell.workouts.length ? colors.accentText : 'transparent' }]} />
          </Pressable> : <View key={'blank-' + i} style={{ width: '14.285714%', minHeight: 52 }} />)}
        </View>
      </View>
    </ScrollView>}
    {result?.ok && result.workouts.length === 0 && <Text style={styles.muted}>{copy.noHistory}</Text>}
    {selectedDate && <Text style={[styles.heading, historyStyles.selectedDate]}>{selectedDate}</Text>}
    {result?.ok && day?.workouts.length === 0 && <Text style={styles.muted}>{zh ? '当天无训练' : 'No workouts on this day'}</Text>}
    {day?.workouts.map(workout => {
      // Android Hermes best-fit can fall back from zh-CN to the device language.
      const time = new Date(workout.completedAt).toLocaleTimeString(zh ? 'zh-CN' : 'en-GB', { localeMatcher: 'lookup', hour: '2-digit', minute: '2-digit' });
      const exercises = formatCount(locale, 'exercises', workout.exerciseCount), sets = formatCount(locale, 'sets', workout.setCount);
      const minutes = Math.floor(workout.durationSeconds / 60);
      return <Pressable key={workout.id} accessibilityRole="button" disabled={writePending} accessibilityState={{ disabled: writePending }}
      accessibilityLabel={[zh ? '查看训练' : 'View workout', time, exercises, sets, minutes + (zh ? ' 分钟' : ' min')].join(zh ? '，' : ', ')}
      onPress={() => onOpen(workout.id)} style={[styles.historyRow, historyStyles.historyRow]}>
      <Text style={styles.numeric}>{time}</Text>
      <Text style={[styles.muted, historyStyles.historySummary]}>{exercises} · {sets} · {minutes} min</Text>
      <Text accessible={false} importantForAccessibility="no" style={[styles.muted, historyStyles.chevron]}>›</Text>
    </Pressable>; })}
  </ScrollView>;
}

const historyStyles = StyleSheet.create({
  monthHeading: { flex: 1, textAlign: 'center', fontWeight: '700' },
  weekday: { flex: 1, textAlign: 'center', fontWeight: '600' },
  dayTarget: { width: '14.285714%', minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  dayNumber: { minWidth: 40, minHeight: 40, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: 'transparent' },
  workoutDot: { width: 5, height: 5, borderRadius: 3, marginTop: 3 },
  selectedDate: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 18, marginTop: 6 },
  historyRow: { flexWrap: 'wrap' },
  historySummary: { flexGrow: 1, flexShrink: 1, flexBasis: 128, minWidth: 0 },
  chevron: { fontSize: 26, lineHeight: 30 },
});
