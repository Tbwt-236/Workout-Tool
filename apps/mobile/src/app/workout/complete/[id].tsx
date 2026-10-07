import { useLocalSearchParams, useRouter } from 'expo-router';
import { WorkoutSummary } from '../../../features/workouts/ui/workout-summary';
export default function Complete() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return <WorkoutSummary id={typeof id === 'string' && /^[1-9]\d{0,15}$/.test(id) ? Number(id) : NaN}
    onBack={() => router.replace('/history')} />;
}
