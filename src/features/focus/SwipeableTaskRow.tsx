import { IconTrash } from '@tabler/icons-react-native';
import { useCallback, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SharedValue } from 'react-native-reanimated';

import { AppIcon, AppText } from '@/src/components';
import { rowDirectionForTextDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, spacing, typography } from '@/src/theme';

import { FocusTaskCard } from './FocusTaskCard';
import { FocusTask } from './types';

type SwipeableTaskRowProps = {
  task: FocusTask;
  onRemove: (task: FocusTask) => void;
};

export function SwipeableTaskRow({ task, onRemove }: SwipeableTaskRowProps) {
  const swipeableRef = useRef<SwipeableMethods>(null);
  const { direction, nativeDirection, t } = useTranslation();
  const actionDirection = useMemo(
    () => ({
      flexDirection: rowDirectionForTextDirection(direction, nativeDirection),
    }),
    [direction, nativeDirection]
  );

  const handleRemove = useCallback(() => {
    swipeableRef.current?.close();
    onRemove(task);
  }, [onRemove, task]);

  const handleAccessibilityAction = useCallback(
    (event: { nativeEvent: { actionName: string } }) => {
      if (event.nativeEvent.actionName === 'remove') {
        handleRemove();
      }
    },
    [handleRemove]
  );

  const renderRemoveAction = useCallback(
    (
      _progress: SharedValue<number>,
      _translation: SharedValue<number>,
      swipeableMethods: SwipeableMethods
    ) => (
      <View style={styles.actionShell}>
        <Pressable
          accessibilityLabel={t('tasks.removeTask')}
          accessibilityRole="button"
          onPress={() => {
            swipeableMethods.close();
            onRemove(task);
          }}
          style={({ pressed }) => [
            styles.removeAction,
            actionDirection,
            pressed && styles.removeActionPressed,
          ]}>
          <AppIcon icon={IconTrash} size={20} color={colors.white} />
          <AppText style={styles.removeActionText}>{t('tasks.removeTask')}</AppText>
        </Pressable>
      </View>
    ),
    [actionDirection, onRemove, t, task]
  );

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={42}
      leftThreshold={42}
      overshootLeft={false}
      overshootRight={false}
      enableTrackpadTwoFingerGesture
      containerStyle={styles.swipeContainer}
      renderLeftActions={nativeDirection === 'rtl' ? renderRemoveAction : undefined}
      renderRightActions={nativeDirection === 'rtl' ? undefined : renderRemoveAction}>
      <FocusTaskCard
        task={task}
        accessibilityActions={[{ name: 'remove', label: t('tasks.removeTask') }]}
        onAccessibilityAction={handleAccessibilityAction}
      />
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  actionShell: {
    width: 112,
  },
  removeAction: {
    flex: 1,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accentDark,
  },
  removeActionPressed: {
    opacity: 0.86,
  },
  removeActionText: {
    color: colors.white,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.caption,
    textAlign: 'center',
  },
});
