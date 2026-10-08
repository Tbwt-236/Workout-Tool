import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WorkoutScreen } from '../../features/workouts/ui/workout-screen';
export default function Active() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return <WorkoutScreen keyboardVerticalOffset={insets.top} onSaved={id => router.replace({ pathname: '/workout/complete/[id]', params: { id } })} />;
}
