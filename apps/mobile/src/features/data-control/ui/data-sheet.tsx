import { useContext, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useWorkout } from '../../workouts/application/workout-provider';
import type { ListCompletedWorkoutsResult } from '../../workouts/data/workout-repository';
import { Action, colors, styles } from '../../workouts/ui/primitives';
import { LanguageSwitch } from '../../workouts/ui/workout-screen';
import { getDataCopy } from '../../../i18n/data-copy';

export function DataSheet({ result, waitForReads, onReload, onClose }:
  { result: ListCompletedWorkoutsResult | null; waitForReads: () => Promise<void>; onReload: () => void; onClose: () => void }) {
  const { locale, exporter, exportState } = useWorkout();
  const insets = useContext(SafeAreaInsetsContext);
  const [details, setDetails] = useState(false);
  const copy = getDataCopy(locale);
  const busy = !['idle', 'error'].includes(exportState.phase);
  const count = result?.ok ? result.workouts.length : null;
  const dates = result?.ok && result.workouts.length ? result.workouts : null;
  useEffect(() => () => exporter.cancelPending(), [exporter]);
  function close() { exporter.cancelPending(); onClose(); }
  const formatDate = (value: string) => new Date(value).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-GB', { localeMatcher: 'lookup' });
  return <Modal transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
    <View style={[sheet.shade, { paddingTop: Math.max(insets?.top ?? 0, 16) }]}>
      <View accessibilityViewIsModal style={[sheet.panel, { paddingBottom: Math.max(insets?.bottom ?? 0, 16) }]}>
        <View accessible={false} style={sheet.handle} />
        <View style={sheet.header}><Text accessibilityRole="header" style={sheet.title}>{copy.title}</Text>
          <View style={styles.row}><LanguageSwitch /><Action label={copy.close} onPress={close}>×</Action></View></View>
        <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={sheet.body} keyboardShouldPersistTaps="handled">
          <View style={sheet.summary}><Text style={styles.muted}>{copy.completed}</Text>
            {count !== null ? <View style={sheet.total}><Text style={sheet.number}>{count}</Text><Text style={sheet.unit}>{copy.unit(count)}</Text></View>
              : <Text style={styles.muted}>{result ? copy.loadFailed : copy.loading}</Text>}
            {dates && <Text style={styles.muted}>{dates.length === 1 ? formatDate(dates[0].completedAt)
              : formatDate(dates[dates.length - 1].completedAt) + ' – ' + formatDate(dates[0].completedAt)}</Text>}
            {result && !result.ok && <Action onPress={onReload}>{copy.retry}</Action>}
          </View>
          <View style={sheet.format}><Text style={styles.text}>{copy.all}</Text><Text style={styles.text}>JSON</Text></View>
          <Text style={styles.muted}>{copy.scope}</Text>
          {!!exportState.error && <Text accessibilityRole="alert" style={styles.error}>{copy.error(exportState.error)}</Text>}
          <Action primary disabled={busy || count === null || count === 0}
            onPress={() => { void exporter.start(locale, waitForReads()); }}>{busy ? copy.preparing : exportState.error ? copy.retry : copy.export}</Action>
          <Text style={[styles.muted, { textAlign: 'center', fontSize: 12 }]}>{count === 0 ? copy.empty : copy.local}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={copy.more} accessibilityState={{ expanded: details }}
            onPress={() => setDetails(value => !value)} style={sheet.disclosure}>
            <Text style={sheet.unit}>{copy.more}</Text><Text style={styles.text}>{details ? '−' : '+'}</Text></Pressable>
          {details && copy.details.map(([label, body]) => <Text key={label} style={styles.muted}>
            <Text style={{ fontWeight: '700', color: colors.ink }}>{label}</Text>{' · ' + body}</Text>)}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}
const sheet = StyleSheet.create({
  shade: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#152C4240' },
  panel: { backgroundColor: colors.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '90%', flexShrink: 1 },
  handle: { width: 32, height: 4, borderRadius: 4, backgroundColor: colors.line, alignSelf: 'center', marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 6, gap: 8 },
  title: { fontSize: 20, fontWeight: '700', color: colors.ink },
  body: { paddingHorizontal: 24, paddingTop: 6, paddingBottom: 12, gap: 14 },
  summary: { borderLeftWidth: 4, borderColor: colors.orange, paddingLeft: 14, gap: 6, marginBottom: 4 },
  total: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 10 },
  number: { fontSize: 46, fontWeight: '800', letterSpacing: -1.5, color: colors.ink, fontVariant: ['tabular-nums'] },
  unit: { fontSize: 16, fontWeight: '700', color: colors.ink },
  format: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, borderTopWidth: 1, borderColor: colors.line, paddingTop: 16 },
  disclosure: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
});
