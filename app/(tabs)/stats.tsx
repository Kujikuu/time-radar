import { IconTrendingUp } from '@tabler/icons-react-native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText, PrimaryButton, Screen, SegmentedControl, SoftCard } from '@/src/components';
import { DistributionDonut } from '@/src/features/focus/DistributionDonut';
import { FocusBarChart } from '@/src/features/focus/FocusBarChart';
import { useSettings, useStats } from '@/src/features/focus/hooks';
import { StatsRange } from '@/src/features/focus/types';
import { useSupporterPurchase } from '@/src/features/support/purchase';
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
  const [supportMessageKey, setSupportMessageKey] = useState<string | undefined>();
  const { direction, formatDate, formatDuration, locale, nativeDirection, t } = useTranslation();
  const { summary } = useStats(range, locale);
  const { settings, save } = useSettings();
  const contentText = { textAlign: textAlignForTextDirection(direction) };
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };
  const { isWide } = useLayoutProfile();
  const tabInsets = useTabScreenInsets();
  const activateSupporter = useCallback(() => {
    void save({ supporterPurchased: true, supporterThemeEnabled: true });
  }, [save]);
  const supporterPurchase = useSupporterPurchase({
    locallyPurchased: settings.supporterPurchased,
    onPurchased: activateSupporter,
  });
  const supporterMessageKey = supportMessageKey ?? supporterPurchase.status.messageKey;
  const summaryLabel =
    range === 'Day'
      ? `${t('home.today')}, ${formatDate(new Date(), { month: 'short', day: 'numeric' })}`
      : statsRangeLabel(locale, range);

  return (
    <Screen contentStyle={[styles.screen, { paddingBottom: tabInsets.paddingBottom }]}>
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

      {isWide ? (
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
      )}

      <SoftCard
        style={
          settings.supporterPurchased && settings.supporterThemeEnabled
            ? [styles.supportCard, styles.supporterActiveCard]
            : styles.supportCard
        }>
        <AppText style={[styles.supportEyebrow, styles.contentText, contentText]}>
          {settings.supporterPurchased ? t('support.freeForever') : t('support.eyebrow')}
        </AppText>
        <AppText style={[styles.supportTitle, styles.contentText, contentText]}>
          {settings.supporterPurchased ? t('support.purchasedTitle') : t('support.title')}
        </AppText>
        <AppText style={[styles.supportBody, styles.contentText, contentText]}>
          {settings.supporterPurchased ? t('support.purchasedBody') : t('support.body')}
        </AppText>
        {settings.supporterPurchased ? (
          <View style={[styles.supportBadge, contentRow]}>
            <AppText style={styles.supportBadgeText}>{t('support.badge')}</AppText>
          </View>
        ) : (
          <View style={[styles.supportActions, contentRow]}>
            <PrimaryButton
              style={styles.supportButton}
              disabled={supporterPurchase.status.loading}
              onPress={async () => {
                const result = await supporterPurchase.buy();
                setSupportMessageKey(result.messageKey);

                if (result.purchased) {
                  activateSupporter();
                }
              }}>
              {`${t('support.purchaseAction')} ${supporterPurchase.status.priceLabel}`}
            </PrimaryButton>
            <Pressable
              accessibilityLabel={t('support.restore')}
              accessibilityRole="button"
              onPress={async () => {
                const result = await supporterPurchase.restore();
                setSupportMessageKey(result.messageKey);

                if (result.purchased) {
                  activateSupporter();
                }
              }}
              style={({ pressed }) => [styles.restoreButton, pressed && styles.pressed]}>
              <AppText style={styles.restoreText}>{t('support.restore')}</AppText>
            </Pressable>
          </View>
        )}
        {supporterMessageKey ? (
          <AppText style={[styles.supportStatus, styles.contentText, contentText]}>
            {t(supporterMessageKey)}
          </AppText>
        ) : null}
      </SoftCard>
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
  header: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    gap: 1,
  },
  trendValue: {
    color: colors.green,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
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
  supportCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.backgroundWarm,
  },
  supporterActiveCard: {
    borderColor: colors.accentSoft,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.supporterSurface,
  },
  supportEyebrow: {
    color: colors.accentDark,
    fontSize: typography.size.eyebrow,
    fontWeight: typography.weight.extraBold,
    textTransform: 'uppercase',
  },
  supportTitle: {
    color: colors.text,
    fontSize: typography.size.cardTitle,
    fontWeight: typography.weight.bold,
  },
  supportBody: {
    color: colors.textMuted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.paragraph,
  },
  supportActions: {
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  supportButton: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  restoreButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  restoreText: {
    color: colors.accentDark,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },
  supportBadge: {
    minHeight: 38,
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    justifyContent: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfacePeach,
  },
  supportBadgeText: {
    color: colors.accentDark,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },
  supportStatus: {
    color: colors.textMuted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.helper,
  },
  pressed: {
    opacity: 0.76,
  },
});
