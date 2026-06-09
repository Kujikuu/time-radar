import { IconClipboardCheck, IconPlus } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText, IconButton, PrimaryButton, Screen, ScreenHeader, SoftCard } from '@/src/components';
import { useTaskRemoval, useTasks } from '@/src/features/focus/hooks';
import { SwipeableTaskRow } from '@/src/features/focus/SwipeableTaskRow';
import { FocusTask } from '@/src/features/focus/types';
import { useLayoutProfile } from '@/src/hooks/use-layout-profile';
import { useTabScreenInsets } from '@/src/navigation/tablet-sidebar-metrics';
import { rowDirectionForTextDirection, textAlignForTextDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, spacing, typography } from '@/src/theme';

const TASK_REMOVAL_UNDO_TIMEOUT_MS = 4000;

type TasksListScreenProps = {
  embedded?: boolean;
};

export function TasksListScreen({ embedded = false }: TasksListScreenProps) {
  const { tasks, reload } = useTasks();
  const { isTaskActive, remove, restore } = useTaskRemoval();
  const { direction, nativeDirection, t } = useTranslation();
  const { isWide } = useLayoutProfile();
  const tabInsets = useTabScreenInsets();
  const [removedTask, setRemovedTask] = useState<FocusTask | null>(null);
  const [pendingRemovalTask, setPendingRemovalTask] = useState<FocusTask | null>(null);
  const undoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentText = { textAlign: textAlignForTextDirection(direction) };
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };
  const queueBodyKey =
    tasks.length === 0
      ? 'tasks.queueBody.empty'
      : tasks.length === 1
        ? 'tasks.queueBody.one'
        : 'tasks.queueBody.many';
  const bottomInset = embedded || isWide ? spacing.xxl : tabInsets.paddingBottom;

  const clearUndoDismissTimer = useCallback(() => {
    if (!undoDismissTimerRef.current) {
      return;
    }

    clearTimeout(undoDismissTimerRef.current);
    undoDismissTimerRef.current = null;
  }, []);

  useEffect(() => clearUndoDismissTimer, [clearUndoDismissTimer]);

  const confirmRemoveTask = useCallback(
    async (task: FocusTask) => {
      clearUndoDismissTimer();
      setRemovedTask(task);

      try {
        await remove(task.id);
        undoDismissTimerRef.current = setTimeout(() => {
          setRemovedTask(null);
          undoDismissTimerRef.current = null;
        }, TASK_REMOVAL_UNDO_TIMEOUT_MS);
        await reload();
      } catch (error) {
        setRemovedTask(null);
        throw error;
      }
    },
    [clearUndoDismissTimer, reload, remove]
  );

  const handleRemoveTask = useCallback(
    async (task: FocusTask) => {
      if (await isTaskActive(task.id)) {
        setPendingRemovalTask(task);
        return;
      }

      await confirmRemoveTask(task);
    },
    [confirmRemoveTask, isTaskActive]
  );

  const handleCancelActiveRemoval = useCallback(() => {
    setPendingRemovalTask(null);
  }, []);

  const handleConfirmActiveRemoval = useCallback(async () => {
    if (!pendingRemovalTask) {
      return;
    }

    const task = pendingRemovalTask;

    setPendingRemovalTask(null);
    await confirmRemoveTask(task);
  }, [confirmRemoveTask, pendingRemovalTask]);

  const handleUndoRemove = useCallback(async () => {
    if (!removedTask) {
      return;
    }

    clearUndoDismissTimer();
    await restore(removedTask.id);
    setRemovedTask(null);
    await reload();
  }, [clearUndoDismissTimer, reload, removedTask, restore]);

  return (
    <View style={styles.root}>
      <Screen
        scroll
        contentStyle={[
          styles.screen,
          { paddingBottom: removedTask ? bottomInset + 60 : bottomInset },
        ]}>
        <ScreenHeader
          title={t('tasks.title')}
          action={
            <IconButton
              icon={IconPlus}
              label={t('tasks.createTask')}
              onPress={() => router.push('/task/new' as never)}
              color={colors.accentDark}
              style={styles.addButton}
            />
          }
        />

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
        <View style={[styles.undoBar, embedded && styles.undoBarEmbedded, contentRow]}>
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

      <Modal
        animationType="fade"
        transparent
        visible={Boolean(pendingRemovalTask)}
        onRequestClose={handleCancelActiveRemoval}>
        <View style={styles.confirmOverlay}>
          <Pressable
            accessibilityLabel={t('common.cancel')}
            accessibilityRole="button"
            style={StyleSheet.absoluteFill}
            onPress={handleCancelActiveRemoval}
          />
          <View style={styles.confirmPanel} accessibilityRole="alert">
            <View style={styles.confirmCopy}>
              <AppText style={[styles.confirmTitle, styles.contentText, contentText]}>
                {t('tasks.removeActiveTitle')}
              </AppText>
              <AppText style={[styles.confirmBody, styles.contentText, contentText]}>
                {t('tasks.removeActiveBody', {
                  values: { title: pendingRemovalTask?.title ?? '' },
                })}
              </AppText>
            </View>
            <View style={[styles.confirmActions, contentRow]}>
              <Pressable
                accessibilityLabel={t('common.cancel')}
                accessibilityRole="button"
                onPress={handleCancelActiveRemoval}
                style={({ pressed }) => [
                  styles.confirmCancelAction,
                  pressed && styles.confirmActionPressed,
                ]}>
                <AppText style={styles.confirmCancelText}>{t('common.cancel')}</AppText>
              </Pressable>
              <Pressable
                accessibilityLabel={t('tasks.removeActiveConfirm')}
                accessibilityRole="button"
                onPress={handleConfirmActiveRemoval}
                style={({ pressed }) => [
                  styles.confirmAction,
                  pressed && styles.confirmActionPressed,
                ]}>
                <AppText style={styles.confirmActionText}>{t('tasks.removeActiveConfirm')}</AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  contentText: {
    minWidth: 0,
  },
  addButton: {
    flexShrink: 0,
    backgroundColor: colors.surfaceMuted,
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
    borderCurve: 'continuous',
    backgroundColor: colors.text,
    boxShadow: '0 10px 24px rgba(31, 26, 23, 0.18)',
  },
  undoBarEmbedded: {
    right: spacing.lg,
    left: spacing.lg,
    bottom: spacing.lg,
  },
  undoText: {
    flex: 1,
    color: colors.white,
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
  },
  undoAction: {
    minHeight: 44,
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
  confirmOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(31, 26, 23, 0.34)',
  },
  confirmPanel: {
    width: '100%',
    maxWidth: 420,
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: '0 18px 38px rgba(31, 26, 23, 0.18)',
  },
  confirmCopy: {
    gap: spacing.xs,
  },
  confirmTitle: {
    color: colors.text,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.bold,
  },
  confirmBody: {
    color: colors.textMuted,
    fontSize: typography.size.small,
    lineHeight: typography.lineHeight.body,
  },
  confirmActions: {
    gap: spacing.sm,
  },
  confirmAction: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accentDark,
  },
  confirmCancelAction: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  confirmActionPressed: {
    opacity: 0.84,
  },
  confirmActionText: {
    color: colors.white,
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
  confirmCancelText: {
    color: colors.text,
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
});
