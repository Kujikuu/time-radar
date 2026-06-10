import { IconFileText, IconTrendingUp } from '@tabler/icons-react-native';
import { StyleSheet, View } from 'react-native';

import { AppIcon, AppText, SoftCard } from '@/src/components';
import { RadarMark } from '@/src/features/focus/RadarMark';
import { rowDirectionForTextDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, spacing, typography } from '@/src/theme';

export type OnboardingVisualType = 'radar' | 'session' | 'stats';

type OnboardingVisualProps = {
  type: OnboardingVisualType;
};

export function OnboardingVisual({ type }: OnboardingVisualProps) {
  const { direction, nativeDirection, t } = useTranslation();
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };

  if (type === 'radar') {
    return <RadarMark />;
  }

  if (type === 'session') {
    return (
      <View style={styles.visualShell}>
        <SoftCard style={styles.sessionCard}>
          <View style={styles.sessionIcon}>
            <AppIcon icon={IconFileText} size={30} color={colors.accentDark} />
          </View>
          <AppText style={styles.visualTitle}>{t('onboarding.visual.projectProposal')}</AppText>
          <View style={styles.timerPill}>
            <AppText style={styles.timerPillText}>25:00</AppText>
          </View>
          <View style={styles.sessionRows}>
            {[
              t('taskForm.focusDuration'),
              t('taskForm.shortBreak'),
              t('taskForm.longBreak'),
            ].map((label, index) => (
              <View key={label} style={[styles.sessionRow, contentRow]}>
                <AppText style={styles.sessionLabel}>{label}</AppText>
                <AppText style={styles.sessionValue}>
                  {index === 0
                    ? `25 ${t('units.min')}`
                    : index === 1
                      ? `5 ${t('units.min')}`
                      : `15 ${t('units.min')}`}
                </AppText>
              </View>
            ))}
          </View>
        </SoftCard>
      </View>
    );
  }

  return (
    <View style={styles.visualShell}>
      <SoftCard style={styles.statsCard}>
        <View style={[styles.statHeader, contentRow]}>
          <AppText style={styles.visualTitle}>{t('onboarding.visual.today')}</AppText>
          <View style={[styles.trendBadge, contentRow]}>
            <AppIcon icon={IconTrendingUp} size={18} color={colors.green} />
            <AppText style={styles.trendText}>+23%</AppText>
          </View>
        </View>
        <AppText style={styles.bigMetric}>2h 15m</AppText>
        <View style={styles.bars}>
          {[18, 42, 26, 70, 92, 54, 34, 48].map((height, index) => (
            <View key={`${height}-${index}`} style={[styles.bar, { height }]} />
          ))}
        </View>
        <View style={[styles.scoreRow, contentRow]}>
          <AppText style={styles.sessionLabel}>{t('metrics.focusScore')}</AppText>
          <AppText style={styles.sessionValue}>85%</AppText>
        </View>
      </SoftCard>
    </View>
  );
}

const styles = StyleSheet.create({
  visualShell: {
    width: '100%',
    maxWidth: 276,
    alignSelf: 'center',
  },
  sessionCard: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  sessionIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfacePeach,
  },
  visualTitle: {
    color: colors.text,
    fontSize: typography.size.cardTitle,
    fontWeight: typography.weight.bold,
  },
  timerPill: {
    minWidth: 104,
    minHeight: 42,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  timerPillText: {
    color: colors.white,
    fontSize: typography.size.cardTitle,
    fontWeight: typography.weight.extraBold,
    fontVariant: ['tabular-nums'],
  },
  sessionRows: {
    width: '100%',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  sessionRow: {
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sessionLabel: {
    flexShrink: 1,
    color: colors.textMuted,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
  sessionValue: {
    flexShrink: 0,
    color: colors.text,
    fontSize: typography.size.small,
    fontWeight: typography.weight.extraBold,
    fontVariant: ['tabular-nums'],
  },
  statsCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  statHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendBadge: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  trendText: {
    color: colors.green,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.extraBold,
    fontVariant: ['tabular-nums'],
  },
  bigMetric: {
    color: colors.text,
    fontSize: typography.size.metric,
    fontWeight: typography.weight.regular,
    fontVariant: ['tabular-nums'],
  },
  bars: {
    height: 104,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
  },
  bar: {
    flex: 1,
    maxWidth: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  scoreRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
