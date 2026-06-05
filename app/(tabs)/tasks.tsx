import { IconClipboardCheck, IconPlus } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText, Screen, SoftCard } from '@/src/components';
import { FocusTaskCard } from '@/src/features/focus/FocusTaskCard';
import { useTasks } from '@/src/features/focus/hooks';
import { textAlignForTextDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, spacing, typography } from '@/src/theme';

export default function TasksScreen() {
  const { tasks } = useTasks();
  const { direction, t } = useTranslation();
  const contentText = { textAlign: textAlignForTextDirection(direction) };
  const taskLabel = tasks.length === 1 ? t('units.task') : t('units.tasks');

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <AppText style={[styles.title, styles.contentText, contentText]}>{t('tasks.title')}</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('tasks.createTask')}
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
          <AppText style={[styles.summaryTitle, styles.contentText, contentText]}>
            {t('tasks.queueTitle')}
          </AppText>
          <AppText style={[styles.summaryText, styles.contentText, contentText]}>
            {t('tasks.queueBody', { values: { count: tasks.length, taskLabel } })}
          </AppText>
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
  contentText: {
    width: '100%',
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
