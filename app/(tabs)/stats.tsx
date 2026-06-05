import {
  IconBulb,
  IconCalendar,
  IconChevronRight,
  IconTrendingUp,
} from '@tabler/icons-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppIcon, IconButton, Screen, SegmentedControl, SoftCard } from '@/src/components';
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
        <IconButton icon={IconCalendar} label="Pick stats date" size={21} />
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

      <SoftCard style={styles.noteCard}>
        <View style={styles.noteIcon}>
          <AppIcon icon={IconBulb} size={25} color={colors.amber} />
        </View>
        <View style={styles.noteCopy}>
          <Text style={styles.noteTitle}>
            {summary.focusMinutes > 0 ? 'Great consistency!' : 'Ready when you are'}
          </Text>
          <Text style={styles.noteText}>
            You&apos;ve completed {summary.sessions} focus {summary.sessions === '1' ? 'session' : 'sessions'}.
          </Text>
        </View>
        <AppIcon icon={IconChevronRight} size={24} color={colors.accentDark} />
      </SoftCard>
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
  noteCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surfacePeach,
  },
  noteIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  noteCopy: {
    flex: 1,
    gap: 3,
  },
  noteTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 14,
    fontWeight: '700',
  },
  noteText: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 12,
  },
});
