import { useLocalSearchParams } from 'expo-router';

import { Screen } from '@/src/components';
import { TaskDetailContent } from '@/src/features/focus/TaskDetailContent';
import { routeScreenStyles } from '@/src/navigation/route-screen-styles';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen contentStyle={routeScreenStyles.secondaryContent}>
      <TaskDetailContent taskId={id} />
    </Screen>
  );
}
