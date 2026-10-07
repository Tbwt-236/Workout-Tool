import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
export const colors = { paper: '#F6F7F8', surface: '#FFFFFF', ink: '#152C42', muted: '#586A7A',
  line: '#DBE3EB', orange: '#FF641F', accentText: '#A53F00', tint: '#FFF0E7', coolTint: '#E9EFF4', red: '#B9322E' };
export function Action({ children, onPress, label, disabled = false, primary = false, danger = false, quiet = false, secondary = false }:
  { children: ReactNode; onPress: () => void; label?: string; disabled?: boolean; primary?: boolean; danger?: boolean; quiet?: boolean; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}
    disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.action, secondary && styles.secondary, primary && styles.primary, danger && styles.danger, (disabled || pressed) && { opacity: 0.5 }]}>
    <Text style={[styles.actionText, quiet && { color: colors.muted }, primary && { color: colors.ink }, danger && { color: colors.surface }]}>{children}</Text>
  </Pressable>;
}
export function PageHeading({ title, children }: { title: string; children: ReactNode }) {
  return <View style={styles.pageHeading}>
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.headerMotif}>
      <View style={[styles.headerStripe, { right: 68 }]} />
      <View style={[styles.headerStripe, { right: 38 }]} />
      <View style={[styles.headerStripe, { right: 8, backgroundColor: colors.orange }]} />
    </View>
    <View style={styles.top}>
      <View><Text style={styles.wordmark}>FITQUEST</Text><Text accessibilityRole="header" style={styles.title}>{title}</Text></View>
      <View style={[styles.row, { flexWrap: 'wrap' }]}>{children}</View>
    </View>
  </View>;
}
export function Confirmation({ title, children, onClose, immediate = false }:
  { title: string; children: ReactNode; onClose: () => void; immediate?: boolean }) {
  return <Modal transparent animationType={immediate ? 'none' : 'fade'} onRequestClose={onClose}>
    <View style={styles.shade}><View accessibilityViewIsModal style={styles.dialog}>
      <Text accessibilityRole="header" style={styles.heading}>{title}</Text>{children}
    </View></View>
  </Modal>;
}
export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingBottom: 36, gap: 16 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  pageHeading: { minHeight: 100, paddingBottom: 20 },
  headerMotif: { position: 'absolute', right: 0, bottom: 0, width: 132, height: 28, overflow: 'hidden' },
  headerStripe: { position: 'absolute', width: 14, height: 96, top: -32, backgroundColor: colors.line, transform: [{ rotate: '38deg' }] },
  wordmark: { color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginBottom: 4 },
  title: { fontSize: 36, fontWeight: '800', letterSpacing: -0.8, color: colors.ink },
  heading: { fontSize: 23, fontWeight: '700', color: colors.ink, flexShrink: 1 },
  numeric: { fontSize: 24, fontWeight: '700', fontVariant: ['tabular-nums'], color: colors.ink },
  calendarDayText: { fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'], color: colors.ink },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  text: { color: colors.ink, fontSize: 16, lineHeight: 24 },
  error: { color: colors.red, fontSize: 14, lineHeight: 21 },
  block: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.line },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  field: { flex: 1, minWidth: 64, minHeight: 48, paddingHorizontal: 12, fontSize: 18, color: colors.ink,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.muted, borderRadius: 8 },
  inputTray: { backgroundColor: colors.tint, borderRadius: 10, padding: 10, marginHorizontal: -6, gap: 6 },
  inputColumn: { flex: 1, minWidth: 64, gap: 4 },
  inputLabel: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  numericField: { flex: 0, minHeight: 52, fontSize: 24, fontWeight: '700', fontVariant: ['tabular-nums'], paddingHorizontal: 8 },
  setIndex: { minWidth: 24, fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'], color: colors.muted },
  invalidField: { borderColor: colors.red },
  action: { minHeight: 48, minWidth: 48, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  actionText: { fontSize: 16, fontWeight: '700', color: colors.accentText },
  primary: { backgroundColor: colors.orange },
  secondary: { backgroundColor: colors.coolTint },
  danger: { backgroundColor: colors.red },
  shade: { flex: 1, justifyContent: 'center', backgroundColor: '#00000055', padding: 24 },
  dialog: { borderRadius: 18, padding: 24, gap: 18, backgroundColor: colors.surface },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 8 },
});
