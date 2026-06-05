import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, typography } from '@/src/theme';

import { BarPoint } from './types';

type FocusBarChartProps = {
  data: BarPoint[];
};

const chartTicks = [0, 15, 30, 45, 60];
const chartWidth = 310;
const chartHeight = 160;
const chartTop = 12;
const chartAreaHeight = 112;
const chartBarWidth = 9;
const chartMaxMinutes = 60;

export const FocusBarChart = memo(function FocusBarChart({ data }: FocusBarChartProps) {
  const { locale, t } = useTranslation();
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
      const labelX = data.length > 1 ? 28 + gap * index : chartWidth / 2 - 10;
      const barHeight = Math.max(
        4,
        (point.minutes / chartMaxMinutes) * chartAreaHeight,
      );
      const y = chartTop + chartAreaHeight - barHeight;

      return {
        key: `${point.label}-${index}`,
        labelKey: `${point.label}-label-${index}`,
        label: point.label,
        labelX,
        barX,
        y,
        barHeight,
        opacity: point.minutes > 35 ? 0.48 : 0.24,
      };
    });
  }, [data]);

  return (
    <View
      accessible
      accessibilityLabel={summary}
      accessibilityRole="image"
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
              fontSize="10"
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
        {bars.map((bar, index) =>
          index % 2 === 0 ? (
            <SvgText
              key={bar.labelKey}
              x={bar.labelX}
              y={chartHeight - 7}
              fill={colors.textMuted}
              fontSize="10"
              fontFamily={typography.family}>
              {bar.label}
            </SvgText>
          ) : null,
        )}
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
});
