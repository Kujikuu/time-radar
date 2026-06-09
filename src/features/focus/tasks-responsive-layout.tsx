import { Stack, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/src/components';
import { useLayoutProfile } from '@/src/hooks/use-layout-profile';
import { structuralRowDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, spacing } from '@/src/theme';

import { TaskDetailContent, TaskDetailPlaceholder } from './TaskDetailContent';
import { TasksListScreen } from './TasksListScreen';

function extractTaskId(pathname: string) {
  const match = pathname.match(/\/tasks\/([^/]+)$/);
  return match?.[1];
}

function WideTasksSplitLayout() {
  const pathname = usePathname();
  const taskId = extractTaskId(pathname);
  const { direction } = useTranslation();

  return (
    <View style={[styles.split, { flexDirection: structuralRowDirection(direction) }]}>
      <View style={[styles.listPane, { borderEndWidth: StyleSheet.hairlineWidth }]}>
        <TasksListScreen embedded />
      </View>
      <View style={styles.detailPane}>
        <Screen contentStyle={styles.detailScreen}>
          {taskId ? (
            <TaskDetailContent taskId={taskId} showBack={false} />
          ) : (
            <TaskDetailPlaceholder />
          )}
        </Screen>
      </View>
    </View>
  );
}

export function TasksResponsiveLayout() {
  const { isWide } = useLayoutProfile();

  if (isWide) {
    return <WideTasksSplitLayout />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  split: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listPane: {
    width: '38%',
    minWidth: 320,
    maxWidth: 420,
    borderColor: colors.border,
  },
  detailPane: {
    flex: 1,
    minWidth: 0,
  },
  detailScreen: {
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});
