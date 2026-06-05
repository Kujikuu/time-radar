import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, typography } from '@/src/theme';

import { DistributionItem } from './types';

type DistributionDonutProps = {
  data: DistributionItem[];
};

export function DistributionDonut({ data }: DistributionDonutProps) {
  const size = 128;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + item.minutes, 0);
  let offset = 0;

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceMuted}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {data.map((item) => {
          const portion = item.minutes / total;
          const dash = portion * circumference;
          const strokeDashoffset = -offset;
          offset += dash;

          return (
            <Circle
              key={item.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={item.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
        <Circle cx={size / 2} cy={size / 2} r={28} fill={colors.background} />
      </Svg>
      <View style={styles.legend}>
        {data.map((item) => (
          <View key={item.label} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
            <Text style={styles.legendValue}>{formatMinutes(item.minutes)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function formatMinutes(minutes: number) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
  }

  return `${minutes}m`;
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  legend: {
    flex: 1,
    gap: 17,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 13,
    height: 13,
    borderRadius: 999,
  },
  legendLabel: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 14,
  },
  legendValue: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 14,
    fontWeight: '500',
  },
});
