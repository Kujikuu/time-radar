import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, typography } from '@/src/theme';

import { DistributionItem } from './types';

type DistributionDonutProps = {
  data: DistributionItem[];
};

export const DistributionDonut = memo(function DistributionDonut({ data }: DistributionDonutProps) {
  const size = 128;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = useMemo(() => data.reduce((sum, item) => sum + item.minutes, 0), [data]);
  const summary = useMemo(() => {
    if (total === 0) {
      return '0m total';
    }

    const values = data
      .map((item) => `${item.label} ${formatMinutes(item.minutes)}`)
      .join(', ');

    return `${formatMinutes(total)} total, ${values}`;
  }, [data, total]);
  const segments = useMemo(() => {
    let offset = 0;

    return data.flatMap((item) => {
      if (total === 0) {
        return [];
      }

      const portion = item.minutes / total;
      const dash = portion * circumference;
      const strokeDashoffset = -offset;
      offset += dash;

      return [
        {
          label: item.label,
          color: item.color,
          dash,
          strokeDashoffset,
        },
      ];
    });
  }, [circumference, data, total]);

  return (
    <View
      accessible
      accessibilityLabel={`Focus distribution, ${summary}`}
      accessibilityRole="image"
      style={styles.wrapper}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceMuted}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {segments.map((segment) => (
          <Circle
            key={segment.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={segment.color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
            strokeDashoffset={segment.strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ))}
        <Circle cx={size / 2} cy={size / 2} r={28} fill={colors.background} />
      </Svg>
      <View style={styles.legend}>
        {data.map((item) => (
          <View key={item.label} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
            <Text selectable style={styles.legendValue}>
              {formatMinutes(item.minutes)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});

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
