import { IconTrendingUp } from '@tabler/icons-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppIcon, AppText, Screen, SegmentedControl } from '@/src/components';
import { DistributionDonut } from '@/src/features/focus/DistributionDonut';
import { FocusBarChart } from '@/src/features/focus/FocusBarChart';
import { useStats } from '@/src/features/focus/hooks';
import { StatsRange } from '@/src/features/focus/types';
import {
  rowDirectionForTextDirection,
  statsRangeLabel,
  statsRangeOptions,
  textAlignForTextDirection,
} from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, spacing, typography } from '@/src/theme';

export default function StatsScreen() {
  const [range, setRange] = useState<StatsRange>('Day');
  const { direction, formatDate, formatDuration, locale, nativeDirection, t } = useTranslation();
  const { summary } = useStats(range, locale);
  const contentText = { textAlign: textAlignForTextDirection(direction) };
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };
  const summaryLabel =
    range === 'Day'
      ? `${t('home.today')}, ${formatDate(new Date(), { month: 'short', day: 'numeric' })}`
      : statsRangeLabel(locale, range);

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <AppText style={[styles.title, styles.contentText, contentText]}>{t('stats.title')}</AppText>
      </View>

      <SegmentedControl<StatsRange>
        options={statsRangeOptions(locale)}
        value={range}
        onChange={setRange}
      />

      <View style={styles.todayBlock}>
        <AppText style={[styles.dateLabel, styles.contentText, contentText]}>{summaryLabel}</AppText>
        <View style={[styles.metricRow, contentRow]}>
          <View style={styles.focusCopy}>
            <AppText style={[styles.focusValue, styles.contentText, contentText]}>
              {formatDuration(summary.focusMinutes)}
            </AppText>
            <AppText style={[styles.focusLabel, styles.contentText, contentText]}>
              {t('stats.focusTime')}
            </AppText>
          </View>
          <View style={styles.trendBadge}>
            <AppIcon icon={IconTrendingUp} size={20} color={colors.green} />
            <AppText style={styles.trendValue}>
              {summary.trendPercent > 0 ? '+' : ''}
              {summary.trendPercent}%
            </AppText>
            <AppText style={styles.trendLabel}>{t('stats.previous')}</AppText>
          </View>
        </View>
      </View>

      <FocusBarChart data={summary.hourlyFocus} />

      <View style={styles.section}>
        <AppText style={[styles.sectionTitle, styles.contentText, contentText]}>
          {t('stats.distribution')}
        </AppText>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontFamily: typography.family,
    fontSize: typography.size.screenTitle,
    fontWeight: typography.weight.bold,
  },
  contentText: {
    minWidth: 0,
  },
  todayBlock: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  dateLabel: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
  },
  metricRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  focusCopy: {
    flex: 1,
    minWidth: 120,
  },
  focusValue: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: typography.size.stat,
    fontWeight: typography.weight.regular,
  },
  focusLabel: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: typography.size.small,
  },
  trendBadge: {
    width: 96,
    flexShrink: 0,
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
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },
  trendLabel: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: typography.size.eyebrow,
  },
  section: {
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },
});
