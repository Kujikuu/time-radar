import { IconClipboardCheck, IconPlus } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon, Screen, SoftCard } from '@/src/components';
import { FocusTaskCard } from '@/src/features/focus/FocusTaskCard';
import { useTasks } from '@/src/features/focus/hooks';
import { colors, spacing, typography } from '@/src/theme';

export default function TasksScreen() {
  const { tasks } = useTasks();

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create task"
          onPress={() => router.push('/task/new' as never)}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
          <AppIcon icon={IconPlus} size={22} color={colors.accentDark} />
        </Pressable>
      </View>

      <SoftCard style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <AppIcon icon={IconClipboardCheck} size={25} color={colors.accentDark} />
        </View>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>Today&apos;s focus queue</Text>
          <Text style={styles.summaryText}>
            {tasks.length} saved {tasks.length === 1 ? 'task' : 'tasks'} ready for focused work.
          </Text>
        </View>
      </SoftCard>

      <View style={styles.list}>
        {tasks.map((task) => (
          <FocusTaskCard key={task.id} task={task} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: typography.title,
    fontWeight: 'bold',
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
  summaryCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfacePeach,
  },
  summaryCopy: {
    flex: 1,
    gap: 5,
  },
  summaryTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 16,
    fontWeight: '700',
  },
  summaryText: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 13,
    lineHeight: 19,
  },
  list: {
    gap: spacing.md,
  },
});
