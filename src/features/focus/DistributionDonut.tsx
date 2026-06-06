import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { AppText } from '@/src/components';
import {
  focusCategoryLabel,
  rowDirectionForTextDirection,
  textAlignForTextDirection,
} from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, typography } from '@/src/theme';

import { DistributionItem } from './types';

type DistributionDonutProps = {
  data: DistributionItem[];
};

export const DistributionDonut = memo(function DistributionDonut({ data }: DistributionDonutProps) {
  const { direction, locale, nativeDirection, t } = useTranslation();
  const legendText = { textAlign: textAlignForTextDirection(direction) };
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };
  const size = 128;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = useMemo(() => data.reduce((sum, item) => sum + item.minutes, 0), [data]);
  const summary = useMemo(() => {
    if (total === 0) {
      return t('stats.zeroTotal');
    }

    const values = data
      .map((item) => `${focusCategoryLabel(locale, item.label)} ${formatMinutes(item.minutes, locale)}`)
      .join(', ');

    return `${t('stats.totalMinutes', { values: { value: formatMinutes(total, locale) } })}, ${values}`;
  }, [data, locale, t, total]);
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
      accessibilityLabel={t('stats.distributionSummary', { values: { summary } })}
      accessibilityRole="image"
      style={[styles.wrapper, contentRow]}>
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
          <View key={item.label} style={[styles.legendRow, contentRow]}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <AppText style={[styles.legendLabel, legendText]}>
              {focusCategoryLabel(locale, item.label)}
            </AppText>
            <AppText selectable style={[styles.legendValue, legendText]}>
              {formatMinutes(item.minutes, locale)}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
});

function formatMinutes(minutes: number, locale = 'en') {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    if (locale === 'ar') {
      return remaining ? `${hours}س ${remaining}د` : `${hours}س`;
    }

    return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
  }

  return locale === 'ar' ? `${minutes}د` : `${minutes}m`;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 20,
  },
  legend: {
    flex: 1,
    gap: 17,
  },
  legendRow: {
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 13,
    height: 13,
    flexShrink: 0,
    borderRadius: 999,
  },
  legendLabel: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: typography.size.control,
  },
  legendValue: {
    color: colors.text,
    fontSize: typography.size.control,
    fontWeight: typography.weight.medium,
  },
});
