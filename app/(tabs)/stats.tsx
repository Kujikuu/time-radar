import { IconTrendingUp } from '@tabler/icons-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppIcon, Screen, SegmentedControl } from '@/src/components';
import { DistributionDonut } from '@/src/features/focus/DistributionDonut';
import { FocusBarChart } from '@/src/features/focus/FocusBarChart';
import { useStats } from '@/src/features/focus/hooks';
import { StatsRange } from '@/src/features/focus/types';
import { colors, radius, spacing, typography } from '@/src/theme';

export default function StatsScreen() {
  const [range, setRange] = useState<StatsRange>('Day');
  const { summary } = useStats(range);

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Stats</Text>
      </View>

      <SegmentedControl<StatsRange>
        options={['Day', 'Week', 'Month', 'Year']}
        value={range}
        onChange={setRange}
      />

      <View style={styles.todayBlock}>
        <Text style={styles.dateLabel}>{summary.label}</Text>
        <View style={styles.metricRow}>
          <View>
            <Text style={styles.focusValue}>{summary.focusTime}</Text>
            <Text style={styles.focusLabel}>Focus Time</Text>
          </View>
          <View style={styles.trendBadge}>
            <AppIcon icon={IconTrendingUp} size={20} color={colors.green} />
            <Text style={styles.trendValue}>
              {summary.trendPercent > 0 ? '+' : ''}
              {summary.trendPercent}%
            </Text>
            <Text style={styles.trendLabel}>vs previous</Text>
          </View>
        </View>
      </View>

      <FocusBarChart data={summary.hourlyFocus} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Focus Distribution</Text>
        <DistributionDonut data={summary.distribution} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 24,
    fontWeight: '500',
  },
  todayBlock: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  dateLabel: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 13,
    fontWeight: '600',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  focusValue: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 34,
    fontWeight: '400',
  },
  focusLabel: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 13,
  },
  trendBadge: {
    width: 96,
    minHeight: 68,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    gap: 1,
  },
  trendValue: {
    color: colors.green,
    fontFamily: typography.family,
    fontSize: 15,
    fontWeight: '700',
  },
  trendLabel: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 11,
  },
  section: {
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 15,
    fontWeight: '700',
  },
});
