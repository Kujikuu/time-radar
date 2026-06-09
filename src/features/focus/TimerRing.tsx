import {
  IconCheck,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
} from '@tabler/icons-react-native';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

import { AppIcon, AppText } from '@/src/components';
import { useLayoutProfile } from '@/src/hooks/use-layout-profile';
import { rowDirectionForTextDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, typography } from '@/src/theme';

type TimerRingProps = {
  label: string;
  time: string;
  progress?: number;
  presentation?: 'default' | 'immersive';
  primaryActionLabel?: string;
  primaryActionState?: 'start' | 'pause' | 'resume';
  onPrimaryAction?: () => void;
  onReset?: () => void;
  onComplete?: () => void;
  onSurfacePress?: () => void;
  surfaceAccessibilityLabel?: string;
  surfaceAccessibilityHint?: string;
  showSecondaryActions?: boolean;
};

export function TimerRing({
  label,
  time,
  progress = 0,
  presentation = 'default',
  primaryActionLabel = 'Start',
  primaryActionState = 'start',
  onPrimaryAction,
  onReset,
  onComplete,
  onSurfacePress,
  surfaceAccessibilityLabel,
  surfaceAccessibilityHint,
  showSecondaryActions = true,
}: TimerRingProps) {
  const { direction, nativeDirection, t } = useTranslation();
  const { height, width } = useWindowDimensions();
  const { isWide } = useLayoutProfile();
  const isImmersive = presentation === 'immersive';
  const availableSize = isImmersive ? Math.min(width, height) - 56 : width - 64;
  const viewportWidth = Platform.OS === 'web' && typeof window !== 'undefined' ? window.innerWidth : width;
  const defaultCap = isWide && viewportWidth >= 1100 ? 420 : 300;
  const immersiveCap = isWide ? 480 : 380;
  const defaultMin = isWide ? 280 : 248;
  const size = isImmersive
    ? Math.min(immersiveCap, Math.max(286, availableSize))
    : Math.min(defaultCap, Math.max(defaultMin, availableSize));
  const strokeWidth = 14;
  const markerRadius = 8.5;
  const markerStrokeWidth = 4.5;
  const markerClearance = markerRadius + markerStrokeWidth + 2;
  const radius = size / 2 - Math.max(strokeWidth / 2, markerClearance);
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const progressDash = circumference * clampedProgress;
  const markerAngle = -Math.PI / 2 + clampedProgress * Math.PI * 2;
  const markerX = size / 2 + Math.cos(markerAngle) * radius;
  const markerY = size / 2 + Math.sin(markerAngle) * radius;
  const progressOpacity = 0.62 - clampedProgress * 0.34;
  const trackOpacity = 0.18;
  const isPaused = primaryActionState === 'resume';
  const hasActiveTimer = Boolean(onReset || onComplete);
  const canShowSecondaryActions = showSecondaryActions && hasActiveTimer;
  const displayAction = primaryActionLabel;
  const PrimaryIcon = primaryActionState === 'pause' ? IconPlayerPause : IconPlayerPlay;
  const actionDirection = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };

  return (
    <View style={[styles.wrapper, isImmersive && styles.immersiveWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <SvgLinearGradient id="timerAccent" x1="1" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.accentSoft} stopOpacity="0.24" />
            <Stop offset="0.58" stopColor={colors.accent} stopOpacity="0.54" />
            <Stop offset="1" stopColor={colors.accentDark} stopOpacity="0.62" />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#timerAccent)"
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={trackOpacity}
        />
        {clampedProgress > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#timerAccent)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={`${progressDash} ${circumference - progressDash}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            opacity={progressOpacity}
          />
        ) : null}
        <Circle
          cx={markerX}
          cy={markerY}
          r={markerRadius + 4}
          fill={colors.accentSoft}
          opacity={0.2}
        />
        <Circle
          cx={markerX}
          cy={markerY}
          r={markerRadius}
          fill={colors.surface}
          stroke={colors.accent}
          strokeWidth={markerStrokeWidth}
          opacity={0.82}
        />
      </Svg>
      {onSurfacePress ? (
        <Pressable
          accessibilityLabel={surfaceAccessibilityLabel}
          accessibilityHint={surfaceAccessibilityHint}
          accessibilityRole="button"
          onPress={onSurfacePress}
          style={({ pressed }) => [styles.surfacePress, pressed && styles.surfacePressed]}
        />
      ) : null}
      <View pointerEvents="box-none" style={[styles.center, { width: size - 58 }]}>
        <AppText pointerEvents="none" style={[styles.label, isImmersive && styles.immersiveLabel, isPaused && styles.pausedLabel]}>
          {label}
        </AppText>
        <AppText pointerEvents="none" style={[styles.time, isImmersive && styles.immersiveTime]}>
          {time}
        </AppText>
        <Pressable
          accessibilityLabel={displayAction}
          accessibilityRole="button"
          onPress={onPrimaryAction}
          style={({ pressed }) => [
            styles.startButton,
            isImmersive && styles.immersiveStartButton,
            actionDirection,
            isPaused && styles.resumeButton,
            pressed && styles.pressed,
          ]}>
          <AppText style={[styles.startLabel, isImmersive && styles.immersiveStartLabel, isPaused && styles.resumeLabel]}>
            {displayAction}
          </AppText>
          <AppIcon
            icon={PrimaryIcon}
            color={isPaused ? colors.accentDark : colors.white}
            size={isImmersive ? 18 : 16}
            strokeWidth={2.4}
          />
        </Pressable>
        {canShowSecondaryActions ? (
          <View style={[styles.secondaryActions, actionDirection]}>
            {onReset ? (
              <Pressable
                accessibilityLabel={t('timer.actions.reset')}
                accessibilityRole="button"
                onPress={onReset}
                hitSlop={8}
                style={({ pressed }) => [styles.iconAction, pressed && styles.secondaryPressed]}>
                <AppIcon icon={IconRefresh} color={colors.accentDark} size={19} strokeWidth={2.2} />
              </Pressable>
            ) : null}
            {onComplete ? (
              <Pressable
                accessibilityLabel={t('timer.actions.complete')}
                accessibilityRole="button"
                onPress={onComplete}
                hitSlop={8}
                style={({ pressed }) => [styles.iconAction, pressed && styles.secondaryPressed]}>
                <AppIcon icon={IconCheck} color={colors.accentDark} size={20} strokeWidth={2.3} />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  immersiveWrapper: {
    maxWidth: '100%',
  },
  surfacePress: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
  },
  surfacePressed: {
    opacity: 0.96,
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  label: {
    maxWidth: '100%',
    color: colors.textMuted,
    fontSize: typography.size.control,
    fontWeight: typography.weight.medium,
    marginBottom: 8,
    textAlign: 'center',
  },
  immersiveLabel: {
    fontSize: typography.size.bodyLarge,
    marginBottom: 10,
  },
  pausedLabel: {
    color: colors.accentDark,
  },
  time: {
    color: colors.text,
    fontSize: typography.size.timer,
    fontWeight: typography.weight.bold,
    fontVariant: ['tabular-nums'],
    lineHeight: typography.lineHeight.timer,
    marginBottom: 16,
  },
  immersiveTime: {
    fontSize: typography.size.timerImmersive,
    lineHeight: typography.lineHeight.timerImmersive,
    marginBottom: 18,
  },
  startButton: {
    maxWidth: '100%',
    minWidth: 124,
    minHeight: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.accent,
    borderColor: colors.accentDark,
    borderWidth: StyleSheet.hairlineWidth,
  },
  immersiveStartButton: {
    minWidth: 148,
    minHeight: 48,
    paddingHorizontal: 20,
  },
  resumeButton: {
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  startLabel: {
    flexShrink: 1,
    color: colors.white,
    fontSize: typography.size.control,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.body,
    textAlign: 'center',
  },
  immersiveStartLabel: {
    fontSize: typography.size.body,
  },
  resumeLabel: {
    color: colors.accentDark,
  },
  secondaryActions: {
    minHeight: 30,
    alignItems: 'center',
    gap: 20,
    paddingTop: 12,
  },
  iconAction: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundWarm,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  secondaryPressed: {
    opacity: 0.76,
  },
});
