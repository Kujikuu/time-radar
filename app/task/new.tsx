import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, IconButton, Screen } from '@/src/components';
import { TaskForm } from '@/src/features/focus/TaskForm';
import { taskInputFromSettings, useCreateTask, useSettings } from '@/src/features/focus/hooks';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, spacing, typography } from '@/src/theme';

export default function NewTaskScreen() {
  const createTask = useCreateTask();
  const { settings } = useSettings();
  const { direction, t } = useTranslation();
  const BackIcon = direction === 'rtl' ? IconChevronRight : IconChevronLeft;

  const handleSubmit = async (input: ReturnType<typeof taskInputFromSettings>) => {
    const taskId = await createTask(input);
    router.replace(`/session/${taskId}` as never);
  };

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <IconButton icon={BackIcon} label={t('common.goBack')} onPress={() => router.back()} />
        <AppText style={styles.title}>{t('session.newTask')}</AppText>
        <View style={styles.headerSpacer} />
      </View>

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
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: 42,
  },
  title: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 20,
    fontWeight: '700',
  },
});
