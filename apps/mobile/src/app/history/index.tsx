import { useRouter } from 'expo-router';
import { HistoryScreen } from '../../features/workouts/ui/history-screen';
export default function History() {
  const router = useRouter();
  return <HistoryScreen onOpen={id => router.push({ pathname: '/history/[id]', params: { id } })}
    onTrain={() => router.replace('/workout/active')} />;
}
