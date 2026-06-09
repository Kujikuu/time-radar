import { memo, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { AppText } from '@/src/components';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, typography } from '@/src/theme';

import { BarPoint } from './types';

type FocusBarChartProps = {
  data: BarPoint[];
};

const chartTicks = [0, 15, 30, 45, 60];
const defaultChartWidth = 310;
const chartHeight = 160;
const chartTop = 12;
const chartAreaHeight = 112;
const chartBarWidth = 9;
const chartMaxMinutes = 60;

export const FocusBarChart = memo(function FocusBarChart({ data }: FocusBarChartProps) {
  const { locale, t } = useTranslation();
  const [chartWidth, setChartWidth] = useState(defaultChartWidth);
  const total = useMemo(() => data.reduce((sum, point) => sum + point.minutes, 0), [data]);
  const summary = useMemo(
    () => t('stats.chartSummary', { values: { minutes: total } }),
    [t, total]
  );
  const bars = useMemo(() => {
    const gap = data.length > 1 ? (chartWidth - 52) / (data.length - 1) : 0;

    return data.map((point, index) => {
      const barX =
        data.length > 1 ? 38 + gap * index : chartWidth / 2 - chartBarWidth / 2;
      const labelCenterX =
        data.length > 1 ? 38 + gap * index + chartBarWidth / 2 : chartWidth / 2;
      const barHeight = Math.max(
        4,
        (point.minutes / chartMaxMinutes) * chartAreaHeight,
      );
      const y = chartTop + chartAreaHeight - barHeight;

      return {
        key: `${point.label}-${index}`,
        labelKey: `${point.label}-label-${index}`,
        label: point.label,
        labelCenterX,
        barX,
        y,
        barHeight,
        opacity: point.minutes > 35 ? 0.48 : 0.24,
      };
    });
  }, [chartWidth, data]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.max(defaultChartWidth, Math.round(event.nativeEvent.layout.width));

    if (nextWidth !== chartWidth) {
      setChartWidth(nextWidth);
    }
  };

  return (
    <View
      accessible
      accessibilityLabel={summary}
      accessibilityRole="image"
      onLayout={handleLayout}
      style={styles.wrapper}>
      <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {chartTicks.map((tick) => {
          const y =
            chartTop + chartAreaHeight - (tick / chartMaxMinutes) * chartAreaHeight;

          return (
            <Line
              key={tick}
              x1="34"
              x2={chartWidth - 8}
              y1={y}
              y2={y}
              stroke={colors.borderStrong}
              strokeWidth="1"
              opacity="0.75"
            />
          );
        })}
        {chartTicks.map((tick) => {
          const y =
            chartTop + chartAreaHeight - (tick / chartMaxMinutes) * chartAreaHeight + 4;

          return (
            <SvgText
              key={tick}
              x="0"
              y={y}
              fill={colors.textMuted}
              fontSize={typography.size.micro}
              fontFamily={typography.family}>
              {locale === 'ar' ? `${tick}د` : `${tick}m`}
            </SvgText>
          );
        })}
        {bars.map((bar) => (
          <Rect
            key={bar.key}
            x={bar.barX}
            y={bar.y}
            width={chartBarWidth}
            height={bar.barHeight}
            rx={4}
            fill={colors.accent}
            opacity={bar.opacity}
          />
        ))}
      </Svg>
      <View style={styles.axisLabels}>
        {bars.map((bar, index) =>
          index % 2 === 0 ? (
            <AppText
              key={bar.labelKey}
              style={[
                styles.axisLabel,
                { left: `${(bar.labelCenterX / chartWidth) * 100}%` },
              ]}>
              {bar.label}
            </AppText>
          ) : null,
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginTop: 8,
    width: '100%',
  },
  axisLabels: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: 22,
    pointerEvents: 'none',
  },
  axisLabel: {
    position: 'absolute',
    width: 42,
    marginLeft: -21,
    color: colors.textMuted,
    fontSize: typography.size.micro,
    textAlign: 'center',
  },
});
