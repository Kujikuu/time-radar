import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { IconButton, Screen, ScreenHeader } from '@/src/components';
import { TaskForm } from '@/src/features/focus/TaskForm';
import { taskInputFromSettings, useCreateTask, useSettings } from '@/src/features/focus/hooks';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { taskDetailHref } from '@/src/navigation/task-detail-route';
import { spacing } from '@/src/theme';

export default function NewTaskScreen() {
  const createTask = useCreateTask();
  const { settings } = useSettings();
  const { direction, t } = useTranslation();
  const { width } = useWindowDimensions();
  const BackIcon = direction === 'rtl' ? IconChevronRight : IconChevronLeft;

  const handleSubmit = async (input: ReturnType<typeof taskInputFromSettings>) => {
    const taskId = await createTask(input);
    router.replace(taskDetailHref(taskId, width));
  };

  return (
    <Screen contentStyle={styles.screen}>
      <ScreenHeader
        centered
        titleSize="compact"
        title={t('session.newTask')}
        leading={<IconButton icon={BackIcon} label={t('common.goBack')} onPress={() => router.back()} />}
      />

      <TaskForm
        initialValue={taskInputFromSettings(settings)}
        submitLabel={t('taskForm.createTask')}
        onSubmit={handleSubmit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.xl,
    paddingBottom: 34,
  },
});
