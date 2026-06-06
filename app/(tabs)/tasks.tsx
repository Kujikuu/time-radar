import { IconClipboardCheck, IconPlus } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppIcon, AppText, IconButton, PrimaryButton, Screen, SoftCard } from '@/src/components';
import { FocusTaskCard } from '@/src/features/focus/FocusTaskCard';
import { useTasks } from '@/src/features/focus/hooks';
import { rowDirectionForTextDirection, textAlignForTextDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, spacing, typography } from '@/src/theme';

export default function TasksScreen() {
  const { tasks } = useTasks();
  const { direction, nativeDirection, t } = useTranslation();
  const contentText = { textAlign: textAlignForTextDirection(direction) };
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };
  const queueBodyKey =
    tasks.length === 0
      ? 'tasks.queueBody.empty'
      : tasks.length === 1
        ? 'tasks.queueBody.one'
        : 'tasks.queueBody.many';

  return (
    <Screen contentStyle={styles.screen}>
      <View style={[styles.header, contentRow]}>
        <AppText style={[styles.title, styles.contentText, contentText]}>{t('tasks.title')}</AppText>
        <IconButton
          icon={IconPlus}
          label={t('tasks.createTask')}
          onPress={() => router.push('/task/new' as never)}
          color={colors.accentDark}
          style={styles.addButton}
        />
      </View>

      <SoftCard style={[styles.summaryCard, contentRow]}>
        <View style={styles.summaryIcon}>
          <AppIcon icon={IconClipboardCheck} size={25} color={colors.accentDark} />
        </View>
        <View style={styles.summaryCopy}>
          <AppText style={[styles.summaryTitle, styles.contentText, contentText]}>
            {t('tasks.queueTitle')}
          </AppText>
          <AppText style={[styles.summaryText, styles.contentText, contentText]}>
            {t(queueBodyKey, { values: { count: tasks.length } })}
          </AppText>
        </View>
      </SoftCard>

      {tasks.length > 0 ? (
        <View style={styles.list}>
          {tasks.map((task) => (
            <FocusTaskCard key={task.id} task={task} />
          ))}
        </View>
      ) : (
        <SoftCard style={styles.emptyCard}>
          <AppText style={[styles.emptyTitle, styles.contentText, contentText]}>
            {t('tasks.emptyTitle')}
          </AppText>
          <AppText style={[styles.emptyText, styles.contentText, contentText]}>
            {t('tasks.emptyBody')}
          </AppText>
          <PrimaryButton onPress={() => router.push('/task/new' as never)} style={styles.emptyAction}>
            {t('tasks.emptyAction')}
          </PrimaryButton>
        </SoftCard>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontFamily: typography.family,
    fontSize: typography.title,
    fontWeight: 'bold',
  },
  contentText: {
    minWidth: 0,
  },
  addButton: {
    flexShrink: 0,
    backgroundColor: colors.surfaceMuted,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
  summaryCard: {
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
    minWidth: 0,
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
  emptyCard: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 13,
    lineHeight: 19,
  },
  emptyAction: {
    minHeight: 46,
    marginTop: spacing.xs,
  },
});
