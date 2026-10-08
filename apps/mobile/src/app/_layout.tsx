import { useState } from 'react';
import { Slot, usePathname, useRouter } from 'expo-router';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { createExpoWorkoutRepository } from '../features/workouts/data/expo-workout-repository';
import { WorkoutProvider, useWorkout } from '../features/workouts/application/workout-provider';
import { Action, colors, styles } from '../features/workouts/ui/primitives';
export default function Layout() {
  const [repository] = useState(createExpoWorkoutRepository);
  return <SafeAreaProvider><WorkoutProvider repository={repository}><Frame /></WorkoutProvider></SafeAreaProvider>;
}
function Frame() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname(), router = useRouter();
  const { locale, state, deleting } = useWorkout();
  const saving = state.status === 'completing' || deleting;
  return <View style={[styles.page, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
    <StatusBar barStyle="dark-content" />
    <View style={{ flex: 1 }}><Slot /></View>
    <View style={{ flexDirection: 'row', gap: 8, borderTopWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 6 }}>
      <View style={{ flex: 1, borderBottomWidth: 2, borderColor: pathname === '/workout/active' ? colors.ink : 'transparent', paddingBottom: 2 }}><Action quiet primary={pathname === '/workout/active'} disabled={saving} onPress={() => router.replace('/workout/active')}>{locale === 'zh' ? '训练' : 'Train'}</Action></View>
      <View style={{ flex: 1, borderBottomWidth: 2, borderColor: pathname.startsWith('/history') ? colors.ink : 'transparent', paddingBottom: 2 }}><Action quiet primary={pathname.startsWith('/history')} disabled={saving} onPress={() => router.replace('/history')}>{locale === 'zh' ? '历史' : 'History'}</Action></View>
    </View>
  </View>;
}
