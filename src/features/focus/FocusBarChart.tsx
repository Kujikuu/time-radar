import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { colors, typography } from '@/src/theme';

import { BarPoint } from './types';

type FocusBarChartProps = {
  data: BarPoint[];
};

export function FocusBarChart({ data }: FocusBarChartProps) {
  const width = 310;
  const height = 160;
  const top = 12;
  const chartHeight = 112;
  const barWidth = 9;
  const max = 60;

  return (
    <View style={styles.wrapper}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {[0, 15, 30, 45, 60].map((tick) => {
          const y = top + chartHeight - (tick / max) * chartHeight;

          return (
            <Line
              key={tick}
              x1="34"
              x2={width - 8}
              y1={y}
              y2={y}
              stroke={colors.borderStrong}
              strokeWidth="1"
              opacity="0.75"
            />
          );
        })}
        {[0, 15, 30, 45, 60].map((tick) => {
          const y = top + chartHeight - (tick / max) * chartHeight + 4;

          return (
            <SvgText
              key={tick}
              x="0"
              y={y}
              fill={colors.textMuted}
              fontSize="10"
              fontFamily={typography.family}>
              {tick}m
            </SvgText>
          );
        })}
        {data.map((point, index) => {
          const gap = (width - 52) / (data.length - 1);
          const x = 38 + gap * index;
          const barHeight = Math.max(4, (point.minutes / max) * chartHeight);
          const y = top + chartHeight - barHeight;

          return (
            <Rect
              key={`${point.label}-${index}`}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={4}
              fill={colors.accent}
              opacity={point.minutes > 35 ? 0.48 : 0.24}
            />
          );
        })}
        {data.map((point, index) => {
          const gap = (width - 52) / (data.length - 1);
          const x = 28 + gap * index;

          return index % 2 === 0 ? (
            <SvgText
              key={`${point.label}-label-${index}`}
              x={x}
              y={height - 7}
              fill={colors.textMuted}
              fontSize="10"
              fontFamily={typography.family}>
              {point.label}
            </SvgText>
          ) : null;
        })}
      </Svg>
      <Text style={styles.caption}>Focus Time</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
  caption: {
    position: 'absolute',
    left: 0,
    bottom: -2,
    opacity: 0,
  },
});
