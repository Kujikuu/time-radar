import { useLocalSearchParams } from 'expo-router';

import { Screen } from '@/src/components';
import { TaskDetailContent } from '@/src/features/focus/TaskDetailContent';
import { spacing } from '@/src/theme';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen contentStyle={{ gap: spacing.xl, paddingBottom: 34 }}>
      <TaskDetailContent taskId={id} />
    </Screen>
  );
}
