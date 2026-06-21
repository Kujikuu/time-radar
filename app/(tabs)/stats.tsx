import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppIcon,
  AppText,
  LoadingPlaceholder,
  Screen,
  ScreenHeader,
  SegmentedControl,
  SoftCard,
} from '@/src/components';
import { DistributionDonut } from '@/src/features/focus/DistributionDonut';
import { FocusBarChart } from '@/src/features/focus/FocusBarChart';
import { useStats } from '@/src/features/focus/hooks';
import { StatsRange } from '@/src/features/focus/types';
import { trendAccessibilityLabel, trendVisualForPercent } from '@/src/features/focus/trend-visual';
import { useSupporterActions } from '@/src/features/support/use-supporter-actions';
import { useLayoutProfile } from '@/src/hooks/use-layout-profile';
import {
  rowDirectionForTextDirection,
  statsRangeLabel,
  statsRangeOptions,
  structuralRowDirection,
  textAlignForTextDirection,
} from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { useTabScreenInsets } from '@/src/navigation/tablet-sidebar-metrics';
import { colors, radius, spacing, typography } from '@/src/theme';

export default function StatsScreen() {
  const [range, setRange] = useState<StatsRange>('Day');
  const [refreshing, setRefreshing] = useState(false);
  const { direction, formatDate, formatDuration, locale, nativeDirection, t } = useTranslation();
  const { summary, loading, reload } = useStats(range, locale);
  const contentText = { textAlign: textAlignForTextDirection(direction) };
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };
  const { isWide } = useLayoutProfile();
  const tabInsets = useTabScreenInsets();
  const { settings } = useSupporterActions();
  const trendVisual = trendVisualForPercent(summary.trendPercent);
  const hasFocusData = summary.focusMinutes > 0;
  const summaryLabel =
    range === 'Day'
      ? `${t('home.today')}, ${formatDate(new Date(), { month: 'short', day: 'numeric' })}`
      : statsRangeLabel(locale, range);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  return (
    <Screen
      contentStyle={[styles.screen, { paddingBottom: tabInsets.paddingBottom }]}
      refreshing={refreshing}
      onRefresh={handleRefresh}>
      <ScreenHeader title={t('stats.title')} />

      <SegmentedControl<StatsRange>
        options={statsRangeOptions(locale)}
        value={range}
        onChange={setRange}
      />

      {loading ? (
        <LoadingPlaceholder variant="stats" />
      ) : (
        <>
          <View style={styles.todayBlock}>
            <AppText selectable style={[styles.dateLabel, styles.contentText, contentText]}>
              {summaryLabel}
            </AppText>
            <View style={[styles.metricRow, contentRow]}>
              <View style={styles.focusCopy}>
                <AppText selectable style={[styles.focusValue, styles.contentText, contentText]}>
                  {formatDuration(summary.focusMinutes)}
                </AppText>
                <AppText style={[styles.focusLabel, styles.contentText, contentText]}>
                  {t('stats.focusTime')}
                </AppText>
              </View>
              <View
                accessible
                accessibilityLabel={trendAccessibilityLabel(locale, summary.trendPercent)}
                style={styles.trendBadge}>
                <AppIcon icon={trendVisual.icon} size={20} color={trendVisual.color} />
                <AppText
                  selectable
                  style={[styles.trendValue, { color: trendVisual.color }]}>
                  {summary.trendPercent > 0 ? '+' : ''}
                  {summary.trendPercent}%
                </AppText>
                <AppText style={styles.trendLabel}>{t('stats.previous')}</AppText>
              </View>
            </View>
          </View>

          {hasFocusData ? (
            isWide ? (
              <View style={[styles.chartRow, { flexDirection: structuralRowDirection(direction) }]}>
                <View style={styles.chartColumn}>
                  <FocusBarChart data={summary.hourlyFocus} />
                </View>
                <View style={styles.chartColumn}>
                  <AppText style={[styles.sectionTitle, styles.contentText, contentText]}>
                    {t('stats.distribution')}
                  </AppText>
                  <DistributionDonut data={summary.distribution} />
                </View>
              </View>
            ) : (
              <>
                <FocusBarChart data={summary.hourlyFocus} />

                <View style={styles.section}>
                  <AppText style={[styles.sectionTitle, styles.contentText, contentText]}>
                    {t('stats.distribution')}
                  </AppText>
                  <DistributionDonut data={summary.distribution} />
                </View>
              </>
            )
          ) : (
            <SoftCard style={styles.emptyCard}>
              <AppText style={[styles.emptyTitle, contentText]}>{t('stats.emptyTitle')}</AppText>
              <AppText style={[styles.emptyBody, contentText]}>{t('stats.emptyBody')}</AppText>
            </SoftCard>
          )}

          {!settings.supporterPurchased ? (
            <Pressable
              accessibilityHint={t('stats.supportLinkHint')}
              accessibilityLabel={t('stats.supportLink')}
              accessibilityRole="button"
              onPress={() => router.push('/(tabs)/settings' as never)}
              style={({ pressed }) => [styles.supportLink, contentRow, pressed && styles.pressed]}>
              <AppText style={styles.supportLinkText}>{t('stats.supportLink')}</AppText>
            </Pressable>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  chartRow: {
    gap: spacing.xl,
    alignItems: 'flex-start',
  },
  chartColumn: {
    flex: 1,
    minWidth: 0,
    gap: spacing.lg,
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
    fontSize: typography.size.stat,
    fontWeight: typography.weight.regular,
    fontVariant: ['tabular-nums'],
  },
  focusLabel: {
    color: colors.textMuted,
    fontSize: typography.size.small,
  },
  trendBadge: {
    width: 96,
    flexShrink: 0,
    minHeight: 68,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    gap: 1,
  },
  trendValue: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    fontVariant: ['tabular-nums'],
  },
  trendLabel: {
    color: colors.textMuted,
    fontSize: typography.size.eyebrow,
  },
  section: {
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },
  emptyCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.backgroundWarm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.bold,
  },
  emptyBody: {
    color: colors.textMuted,
    fontSize: typography.size.small,
    lineHeight: typography.lineHeight.body,
  },
  supportLink: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  supportLinkText: {
    color: colors.accentDark,
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
  },
  pressed: {
    opacity: 0.76,
  },
});
