import { IconClipboardCheck, IconPlus } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText, IconButton, PrimaryButton, Screen, SoftCard } from '@/src/components';
import { useTaskRemoval, useTasks } from '@/src/features/focus/hooks';
import { SwipeableTaskRow } from '@/src/features/focus/SwipeableTaskRow';
import { FocusTask } from '@/src/features/focus/types';
import { rowDirectionForTextDirection, textAlignForTextDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, spacing, typography } from '@/src/theme';

export default function TasksScreen() {
  const { tasks, reload } = useTasks();
  const { isTaskActive, remove, restore } = useTaskRemoval();
  const { direction, nativeDirection, t } = useTranslation();
  const [removedTask, setRemovedTask] = useState<FocusTask | null>(null);
  const contentText = { textAlign: textAlignForTextDirection(direction) };
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };
  const queueBodyKey =
    tasks.length === 0
      ? 'tasks.queueBody.empty'
      : tasks.length === 1
        ? 'tasks.queueBody.one'
        : 'tasks.queueBody.many';

  const confirmRemoveTask = useCallback(
    async (task: FocusTask) => {
      await remove(task.id);
      setRemovedTask(task);
      await reload();
    },
    [reload, remove]
  );

  const handleRemoveTask = useCallback(
    async (task: FocusTask) => {
      if (await isTaskActive(task.id)) {
        Alert.alert(
          t('tasks.removeActiveTitle'),
          t('tasks.removeActiveBody', { values: { title: task.title } }),
          [
            {
              text: t('common.cancel'),
              style: 'cancel',
            },
            {
              text: t('tasks.removeActiveConfirm'),
              style: 'destructive',
              onPress: () => {
                void confirmRemoveTask(task);
              },
            },
          ]
        );
        return;
      }

      await confirmRemoveTask(task);
    },
    [confirmRemoveTask, isTaskActive, t]
  );

  const handleUndoRemove = useCallback(async () => {
    if (!removedTask) {
      return;
    }

    await restore(removedTask.id);
    setRemovedTask(null);
    await reload();
  }, [reload, removedTask, restore]);

  return (
    <View style={styles.root}>
      <Screen contentStyle={[styles.screen, removedTask && styles.screenWithUndo]}>
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
              <SwipeableTaskRow key={task.id} task={task} onRemove={handleRemoveTask} />
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

      {removedTask ? (
        <View style={[styles.undoBar, contentRow]}>
          <AppText style={[styles.undoText, styles.contentText, contentText]}>
            {t('tasks.removedToast')}
          </AppText>
          <Pressable
            accessibilityLabel={t('tasks.removeUndo')}
            accessibilityRole="button"
            onPress={handleUndoRemove}
            style={({ pressed }) => [styles.undoAction, pressed && styles.undoActionPressed]}>
            <AppText style={styles.undoActionText}>{t('tasks.removeUndo')}</AppText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    gap: spacing.lg,
    paddingBottom: 100,
  },
  screenWithUndo: {
    paddingBottom: 160,
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
    fontSize: typography.size.screenTitle,
    fontWeight: typography.weight.bold,
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
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.bold,
  },
  summaryText: {
    color: colors.textMuted,
    fontSize: typography.size.small,
    lineHeight: typography.lineHeight.body,
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
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.bold,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.size.small,
    lineHeight: typography.lineHeight.body,
  },
  emptyAction: {
    minHeight: 46,
    marginTop: spacing.xs,
  },
  undoBar: {
    position: 'absolute',
    right: 20,
    bottom: 92,
    left: 20,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.text,
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 22,
      },
      android: {
        elevation: 8,
      },
      default: {
        boxShadow: '0 10px 22px rgba(31, 26, 23, 0.14)',
      },
    }),
  },
  undoText: {
    flex: 1,
    color: colors.white,
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
  },
  undoAction: {
    minHeight: 38,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  undoActionPressed: {
    opacity: 0.86,
  },
  undoActionText: {
    color: colors.accentDark,
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
});
