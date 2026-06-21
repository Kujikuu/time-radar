import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components';
import type { TimerPhase } from '@/src/features/focus/types';
import { rowDirectionForTextDirection, textAlignForTextDirection, timerPhaseLabel } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, spacing, typography } from '@/src/theme';

const TOAST_DURATION_MS = 4000;

type PhaseCompletionToastProps = {
  phase: TimerPhase;
  onDismiss: () => void;
};

export function PhaseCompletionToast({ phase, onDismiss }: PhaseCompletionToastProps) {
  const { direction, locale, nativeDirection, t } = useTranslation();
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };
  const contentText = { textAlign: textAlignForTextDirection(direction) };
  const phaseName = timerPhaseLabel(locale, phase);

  useEffect(() => {
    const timer = setTimeout(onDismiss, TOAST_DURATION_MS);

    return () => clearTimeout(timer);
  }, [onDismiss, phase]);

  return (
    <View style={[styles.bar, contentRow]}>
      <AppText
        accessibilityLiveRegion="polite"
        aria-live="polite"
        style={[styles.text, contentText]}>
        {t('timer.completionToast', { values: { phase: phaseName } })}
      </AppText>
      <Pressable
        accessibilityLabel={t('common.dismiss')}
        accessibilityRole="button"
        onPress={onDismiss}
        style={({ pressed }) => [styles.dismiss, pressed && styles.dismissPressed]}>
        <AppText style={styles.dismissText}>{t('common.dismiss')}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    right: spacing.lg,
    left: spacing.lg,
    bottom: 92,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.accentDark,
    boxShadow: '0 10px 24px rgba(31, 26, 23, 0.18)',
  },
  text: {
    flex: 1,
    color: colors.white,
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
  },
  dismiss: {
    minHeight: 44,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  dismissPressed: {
    opacity: 0.86,
  },
  dismissText: {
    color: colors.accentDark,
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
});
