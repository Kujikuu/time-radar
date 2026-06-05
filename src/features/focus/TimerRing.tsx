import {
  IconCheck,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
} from '@tabler/icons-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

import { AppIcon } from '@/src/components';
import { colors, typography } from '@/src/theme';

type TimerRingProps = {
  label: string;
  time: string;
  progress?: number;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onReset?: () => void;
  onComplete?: () => void;
};

export function TimerRing({
  label,
  time,
  progress = 0,
  primaryActionLabel = 'Start',
  onPrimaryAction,
  onReset,
  onComplete,
}: TimerRingProps) {
  const size = 300;
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
  const isPaused = primaryActionLabel === 'Resume';
  const hasActiveTimer = Boolean(onReset || onComplete);
  const displayAction =
    primaryActionLabel === 'Start'
      ? 'Start Focus'
      : primaryActionLabel === 'Resume'
        ? 'Resume'
        : primaryActionLabel;
  const PrimaryIcon = primaryActionLabel === 'Pause' ? IconPlayerPause : IconPlayerPlay;

  return (
    <View style={styles.wrapper}>
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
      <View style={styles.center}>
        <Text style={[styles.label, isPaused && styles.pausedLabel]}>{label}</Text>
        <Text selectable style={styles.time}>{time}</Text>
        <Pressable
          accessibilityLabel={displayAction}
          accessibilityRole="button"
          onPress={onPrimaryAction}
          style={({ pressed }) => [
            styles.startButton,
            isPaused && styles.resumeButton,
            pressed && styles.pressed,
          ]}>
          <Text style={[styles.startLabel, isPaused && styles.resumeLabel]}>{displayAction}</Text>
          <AppIcon
            icon={PrimaryIcon}
            color={isPaused ? colors.accentDark : colors.white}
            size={16}
            strokeWidth={2.4}
          />
        </Pressable>
        {hasActiveTimer ? (
          <View style={styles.secondaryActions}>
            {onReset ? (
              <Pressable
                accessibilityLabel="Reset timer"
                accessibilityRole="button"
                onPress={onReset}
                hitSlop={8}
                style={({ pressed }) => [styles.iconAction, pressed && styles.secondaryPressed]}>
                <AppIcon icon={IconRefresh} color={colors.accentDark} size={19} strokeWidth={2.2} />
              </Pressable>
            ) : null}
            {onComplete ? (
              <Pressable
                accessibilityLabel="Complete current phase"
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
    width: 280,
    height: 280,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  label: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  pausedLabel: {
    color: colors.accentDark,
  },
  time: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 44,
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
    lineHeight: 52,
    marginBottom: 16,
  },
  startButton: {
    minWidth: 124,
    minHeight: 42,
    flexDirection: 'row',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.accent,
    borderColor: colors.accentDark,
    borderWidth: StyleSheet.hairlineWidth,
  },
  resumeButton: {
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  startLabel: {
    color: colors.white,
    fontFamily: typography.family,
    fontSize: 14,
    fontWeight: '700',
  },
  resumeLabel: {
    color: colors.accentDark,
  },
  secondaryActions: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingTop: 9,
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
