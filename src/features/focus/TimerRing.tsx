import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, typography } from '@/src/theme';

type TimerRingProps = {
  label: string;
  time: string;
  progress?: number;
};

export function TimerRing({ label, time, progress = 0.82 }: TimerRingProps) {
  const size = 230;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.accentSoft}
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={0.52}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.accent}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          opacity={0.55}
        />
        <Circle
          cx={size / 2}
          cy={strokeWidth / 2}
          r={6}
          fill={colors.surface}
          stroke={colors.accent}
          strokeWidth={3}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.time}>{time}</Text>
        <View style={styles.startButton}>
          <Text style={styles.startLabel}>Start</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 230,
    height: 230,
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
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  time: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 38,
    fontWeight: '400',
    marginBottom: 18,
  },
  startButton: {
    minWidth: 86,
    minHeight: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  startLabel: {
    color: colors.white,
    fontFamily: typography.family,
    fontSize: 15,
    fontWeight: '700',
  },
});
