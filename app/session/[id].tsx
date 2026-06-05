import {
  IconChevronDown,
  IconChevronLeft,
  IconDots,
  IconFileText,
} from '@tabler/icons-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppIcon, IconButton, PrimaryButton, Screen, SoftCard } from '@/src/components';
import { TaskForm } from '@/src/features/focus/TaskForm';
import { taskInputFromTask, useFocusTimer, useTaskDetail } from '@/src/features/focus/hooks';
import { colors, radius, spacing, typography } from '@/src/theme';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { task, save } = useTaskDetail(id);
  const { start } = useFocusTimer();

  if (!task) {
    return (
      <Screen contentStyle={styles.screen}>
        <View style={styles.header}>
          <IconButton icon={IconChevronLeft} label="Go back" onPress={() => router.back()} />
        </View>
        <SoftCard style={styles.emptyCard}>
          <Text style={styles.optionTitle}>Task not found</Text>
          <Text style={styles.optionSubtitle}>Go back and choose another focus task.</Text>
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
        <IconButton icon={IconChevronLeft} label="Go back" onPress={() => router.back()} />
        <IconButton icon={IconDots} label="More session options" />
      </View>

      <View style={styles.hero}>
        <View style={styles.documentIcon}>
          <AppIcon icon={IconFileText} size={34} color={colors.accentDark} />
        </View>
        <Text style={styles.title}>{task.title}</Text>
        <View style={styles.categoryPill}>
          <View style={styles.categoryDot} />
          <Text style={styles.categoryText}>{task.category}</Text>
          <AppIcon icon={IconChevronDown} size={17} color={colors.accentDark} />
        </View>
      </View>

      <TaskForm
        key={task.updatedAt}
        initialValue={taskInputFromTask(task)}
        submitLabel="Save Changes"
        onSubmit={save}
      />

      <View style={styles.footerActions}>
        <PrimaryButton onPress={handleStart}>Start Session</PrimaryButton>
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
  documentIcon: {
    width: 74,
    height: 74,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
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
