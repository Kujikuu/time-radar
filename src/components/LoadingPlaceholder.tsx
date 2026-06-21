import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, spacing } from '@/src/theme';

type LoadingPlaceholderProps = {
  variant: 'home' | 'list' | 'stats' | 'detail';
  style?: StyleProp<ViewStyle>;
};

function Block({ height, width = '100%' }: { height: number; width?: number | `${number}%` }) {
  return <View style={[styles.block, { height, width }]} />;
}

export function LoadingPlaceholder({ variant, style }: LoadingPlaceholderProps) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityLabel={t('common.loading')}
      accessibilityRole="progressbar"
      aria-busy
      style={[styles.root, style]}>
      <AppText accessibilityLiveRegion="polite" aria-live="polite" style={styles.liveRegion}>
        {t('common.loading')}
      </AppText>

      {variant === 'home' ? (
        <>
          <Block height={342} />
          <Block height={88} />
          <View style={styles.metricsRow}>
            <Block height={72} width="32%" />
            <Block height={72} width="32%" />
            <Block height={72} width="32%" />
          </View>
          <Block height={80} />
        </>
      ) : null}

      {variant === 'list' ? (
        <>
          <Block height={88} />
          <Block height={80} />
          <Block height={80} />
          <Block height={80} />
        </>
      ) : null}

      {variant === 'stats' ? (
        <>
          <Block height={72} />
          <Block height={160} />
          <Block height={128} />
        </>
      ) : null}

      {variant === 'detail' ? (
        <>
          <Block height={28} width="70%" />
          <Block height={24} width="40%" />
          <Block height={180} />
          <Block height={220} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.lg,
  },
  liveRegion: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  block: {
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceMuted,
    opacity: 0.72,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
});
