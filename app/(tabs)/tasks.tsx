import { IconClipboardCheck, IconPlus } from '@tabler/icons-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { FocusTaskCard } from '@/src/features/focus/FocusTaskCard';
import { focusTasks } from '@/src/features/focus/mock-data';
import { AppIcon, Screen, SoftCard } from '@/src/components';
import { colors, spacing, typography } from '@/src/theme';

export default function TasksScreen() {
  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <View style={styles.addButton}>
          <AppIcon icon={IconPlus} size={22} color={colors.accentDark} />
        </View>
      </View>

      <SoftCard style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <AppIcon icon={IconClipboardCheck} size={25} color={colors.accentDark} />
        </View>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>Today&apos;s focus queue</Text>
          <Text style={styles.summaryText}>
            Keep the first version intentionally simple: task data is mocked and ready for SQLite.
          </Text>
        </View>
      </SoftCard>

      <View style={styles.list}>
        {focusTasks.map((task) => (
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
    fontSize: 24,
    fontWeight: '500',
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
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
