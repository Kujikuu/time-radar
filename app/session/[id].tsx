import { IconChevronLeft } from '@tabler/icons-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, IconButton, PrimaryButton, Screen, SoftCard } from '@/src/components';
import { TaskForm } from '@/src/features/focus/TaskForm';
import { taskInputFromTask, useFocusTimer, useTaskDetail } from '@/src/features/focus/hooks';
import { focusCategoryLabel } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, spacing, typography } from '@/src/theme';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { task, save } = useTaskDetail(id);
  const { start } = useFocusTimer();
  const { locale, t } = useTranslation();

  if (!task) {
    return (
      <Screen contentStyle={styles.screen}>
        <View style={styles.header}>
          <IconButton icon={IconChevronLeft} label={t('common.goBack')} onPress={() => router.back()} />
        </View>
        <SoftCard style={styles.emptyCard}>
          <AppText style={styles.optionTitle}>{t('session.taskNotFound')}</AppText>
          <AppText style={styles.optionSubtitle}>{t('session.taskNotFoundBody')}</AppText>
        </SoftCard>
      </Screen>
    );
  }

  const handleStart = async () => {
    await start(task.id);
    router.replace('/(tabs)' as never);
  };

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <IconButton icon={IconChevronLeft} label={t('common.goBack')} onPress={() => router.back()} />
      </View>

      <View style={styles.hero}>
        <AppText style={styles.title}>{task.title}</AppText>
        <View style={styles.categoryPill}>
          <View style={styles.categoryDot} />
          <AppText style={styles.categoryText}>{focusCategoryLabel(locale, task.category)}</AppText>
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
  hero: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 22,
    fontWeight: '500',
  },
  categoryPill: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
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
    fontFamily: typography.family,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    gap: 5,
    padding: spacing.lg,
  },
  optionTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 14,
    fontWeight: '700',
  },
  optionSubtitle: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 12,
    marginTop: 3,
  },
  footerActions: {
    gap: spacing.lg,
    marginTop: 'auto',
  },
});
