import { IconTrash } from '@tabler/icons-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  runOnJS,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AppIcon, AppText } from '@/src/components';
import { rowDirectionForTextDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, spacing, typography } from '@/src/theme';

import { FocusTaskCard } from './FocusTaskCard';
import { FocusTask } from './types';

const SWIPE_ACTION_WIDTH = 112;
const SWIPE_OPEN_THRESHOLD = 42;
const SWIPE_SPRING = {
  damping: 20,
  stiffness: 220,
};

type SwipeableTaskRowProps = {
  task: FocusTask;
  onRemove: (task: FocusTask) => void;
};

export function SwipeableTaskRow({ task, onRemove }: SwipeableTaskRowProps) {
  const { direction, nativeDirection, t } = useTranslation();
  const [isActionOpen, setActionOpen] = useState(false);
  const translateX = useSharedValue(0);
  const openOffset = direction === 'rtl' ? -SWIPE_ACTION_WIDTH : SWIPE_ACTION_WIDTH;
  const actionSideStyle = direction === 'rtl' ? styles.actionOnRight : styles.actionOnLeft;
  const actionShapeStyle =
    direction === 'rtl' ? styles.removeActionOnRight : styles.removeActionOnLeft;
  const actionDirection = useMemo(
    () => ({
      flexDirection: rowDirectionForTextDirection(direction, nativeDirection),
    }),
    [direction, nativeDirection]
  );

  const closeRow = useCallback(() => {
    setActionOpen(false);
    // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are intentionally mutable.
    translateX.value = withSpring(0, SWIPE_SPRING);
  }, [translateX]);

  const handleRemove = useCallback(() => {
    closeRow();
    onRemove(task);
  }, [closeRow, onRemove, task]);

  const handleAccessibilityAction = useCallback(
    (event: { nativeEvent: { actionName: string } }) => {
      if (event.nativeEvent.actionName === 'remove') {
        handleRemove();
      }
    },
    [handleRemove]
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
          const nextOffset =
            openOffset > 0
              ? Math.min(Math.max(event.translationX, 0), SWIPE_ACTION_WIDTH)
              : Math.max(Math.min(event.translationX, 0), -SWIPE_ACTION_WIDTH);

          // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are intentionally mutable.
          translateX.value = nextOffset;
        })
        .onEnd(() => {
          const shouldOpen = Math.abs(translateX.value) > SWIPE_OPEN_THRESHOLD;
          runOnJS(setActionOpen)(shouldOpen);
          // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are intentionally mutable.
          translateX.value = withSpring(shouldOpen ? openOffset : 0, SWIPE_SPRING);
        }),
    [openOffset, translateX]
  );

  const cardAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateX: translateX.value }],
    }),
    [translateX]
  );

  return (
    <View style={styles.swipeContainer}>
      <View style={[styles.actionLayer, actionSideStyle]}>
        <Pressable
          aria-hidden
          accessibilityElementsHidden
          accessible={false}
          focusable={false}
          importantForAccessibility="no-hide-descendants"
          disabled={!isActionOpen}
          onPress={handleRemove}
          tabIndex={-1}
          style={({ pressed }) => [
            styles.removeAction,
            actionShapeStyle,
            actionDirection,
            pressed && styles.removeActionPressed,
          ]}>
          <AppIcon icon={IconTrash} size={20} color={colors.white} />
          <AppText style={styles.removeActionText}>{t('tasks.removeTask')}</AppText>
        </Pressable>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={cardAnimatedStyle}>
          <FocusTaskCard
            task={task}
            accessibilityActions={[{ name: 'remove', label: t('tasks.removeTask') }]}
            onAccessibilityAction={handleAccessibilityAction}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  actionLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SWIPE_ACTION_WIDTH,
    zIndex: 0,
  },
  actionOnLeft: {
    left: 0,
  },
  actionOnRight: {
    right: 0,
  },
  removeAction: {
    flex: 1,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderCurve: 'continuous',
    backgroundColor: colors.accentDark,
  },
  removeActionOnLeft: {
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  removeActionOnRight: {
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
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
