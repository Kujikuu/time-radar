import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, IconButton, PrimaryButton, ScreenHeader, SoftCard } from '@/src/components';
import { TaskForm } from '@/src/features/focus/TaskForm';
import { taskInputFromTask, useFocusTimer, useTaskDetail } from '@/src/features/focus/hooks';
import { focusCategoryLabel, rowDirectionForTextDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, spacing, typography } from '@/src/theme';

type TaskDetailContentProps = {
  taskId: string;
  showBack?: boolean;
  onBack?: () => void;
};

export function TaskDetailContent({ taskId, showBack = true, onBack }: TaskDetailContentProps) {
  const { task, save } = useTaskDetail(taskId);
  const { start } = useFocusTimer();
  const { direction, locale, nativeDirection, t } = useTranslation();
  const BackIcon = direction === 'rtl' ? IconChevronRight : IconChevronLeft;
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    router.back();
  };

  if (!task) {
    return (
      <View style={styles.container}>
        {showBack ? (
          <ScreenHeader
            title={t('tasks.detailTitle')}
            titleSize="compact"
            leading={<IconButton icon={BackIcon} label={t('common.goBack')} onPress={handleBack} />}
          />
        ) : null}
        <SoftCard style={styles.emptyCard}>
          <AppText style={styles.optionTitle}>{t('session.taskNotFound')}</AppText>
          <AppText style={styles.optionSubtitle}>{t('session.taskNotFoundBody')}</AppText>
        </SoftCard>
      </View>
    );
  }

  const handleStart = async () => {
    await start(task.id);
    router.replace('/(tabs)' as never);
  };

  return (
    <View style={styles.container}>
      {showBack ? (
        <ScreenHeader
          title={t('tasks.detailTitle')}
          titleSize="compact"
          leading={<IconButton icon={BackIcon} label={t('common.goBack')} onPress={handleBack} />}
        />
      ) : null}

      <View style={styles.hero}>
        <AppText selectable style={styles.title}>
          {task.title}
        </AppText>
        <View style={[styles.categoryPill, contentRow]}>
          <View style={styles.categoryDot} />
          <AppText selectable style={styles.categoryText}>
            {focusCategoryLabel(locale, task.category)}
          </AppText>
        </View>
      </View>

      <TaskForm
        key={task.updatedAt}
        initialValue={taskInputFromTask(task)}
        submitLabel={t('taskForm.saveChanges')}
        onSubmit={save}
      />

      <View style={styles.footerActions}>
        <PrimaryButton onPress={handleStart}>{t('session.startSession')}</PrimaryButton>
      </View>
    </View>
  );
}

export function TaskDetailPlaceholder() {
  const { t } = useTranslation();

  return (
    <View style={styles.placeholder}>
      <AppText style={styles.placeholderTitle}>{t('tasks.selectTaskTitle')}</AppText>
      <AppText style={styles.placeholderBody}>{t('tasks.selectTaskBody')}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: typography.size.heading,
    fontWeight: typography.weight.medium,
    textAlign: 'center',
  },
  categoryPill: {
    minHeight: 34,
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
  },
  categoryDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  categoryText: {
    color: colors.accentDark,
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
  },
  emptyCard: {
    gap: 5,
    padding: spacing.lg,
  },
  optionTitle: {
    color: colors.text,
    fontSize: typography.size.control,
    fontWeight: typography.weight.bold,
  },
  optionSubtitle: {
    color: colors.textMuted,
    fontSize: typography.size.caption,
    marginTop: 3,
  },
  footerActions: {
    gap: spacing.lg,
    marginTop: 'auto',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
  },
  placeholderTitle: {
    color: colors.text,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
  placeholderBody: {
    color: colors.textMuted,
    fontSize: typography.size.small,
    lineHeight: typography.lineHeight.body,
    textAlign: 'center',
  },
});
