import { IconFileText, IconPlayerPlay } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppIcon, AppText, SoftCard } from '@/src/components';
import { useFocusTimer } from '@/src/features/focus/hooks';
import { rowDirectionForTextDirection, textAlignForTextDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { taskDetailHref } from '@/src/navigation/task-detail-route';
import { colors, radius, typography } from '@/src/theme';

import { FocusTask } from './types';

type FocusTaskCardProps = {
  task: FocusTask;
  accessibilityActions?: { name: string; label?: string }[];
  onAccessibilityAction?: (event: { nativeEvent: { actionName: string } }) => void;
};

export function FocusTaskCard({
  task,
  accessibilityActions,
  onAccessibilityAction,
}: FocusTaskCardProps) {
  const { direction, formatDuration, nativeDirection, t } = useTranslation();
  const { width } = useWindowDimensions();
  const { start } = useFocusTimer();
  const contentText = { textAlign: textAlignForTextDirection(direction) };
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };

  const openTaskDetail = () => {
    router.push(taskDetailHref(task.id, width));
  };

  const handleStartSession = async () => {
    await start(task.id);
    router.replace('/(tabs)' as never);
  };

  return (
    <SoftCard style={[styles.card, contentRow]}>
      <Pressable
        accessibilityActions={accessibilityActions}
        accessibilityLabel={t('tasks.openTask', {
          values: { title: task.title, minutes: task.focusMinutes },
        })}
        accessibilityRole="button"
        onAccessibilityAction={onAccessibilityAction}
        onPress={openTaskDetail}
        style={({ pressed }) => [styles.body, contentRow, pressed && styles.pressed]}>
        <View style={styles.iconWrap}>
          <AppIcon icon={IconFileText} size={26} color={colors.accentDark} />
        </View>
        <View style={styles.copy}>
          <AppText selectable style={[styles.title, styles.contentText, contentText]}>
            {task.title}
          </AppText>
          <AppText selectable style={[styles.meta, styles.contentText, contentText]}>
            {formatDuration(task.focusMinutes)}
          </AppText>
        </View>
      </Pressable>
      <Pressable
        accessibilityLabel={t('tasks.startTask', {
          values: { title: task.title, minutes: task.focusMinutes },
        })}
        accessibilityRole="button"
        onPress={handleStartSession}
        style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}>
        <AppIcon icon={IconPlayerPlay} size={18} color={colors.text} />
      </Pressable>
    </SoftCard>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.86,
  },
  card: {
    minHeight: 80,
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  body: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 48,
    flexShrink: 0,
    height: 48,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfacePeach,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  contentText: {
    minWidth: 0,
  },
  title: {
    flexShrink: 1,
    color: colors.text,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.size.caption,
    fontVariant: ['tabular-nums'],
  },
  playButton: {
    width: 44,
    flexShrink: 0,
    height: 44,
    borderRadius: radius.pill,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
});
