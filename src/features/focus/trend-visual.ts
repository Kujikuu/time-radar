import { IconMinus, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react-native';

import type { TablerIcon } from '@/src/components';
import type { AppLocale } from '@/src/i18n';
import { translate } from '@/src/i18n';
import { colors } from '@/src/theme';

export type TrendVisual = {
  icon: TablerIcon;
  color: string;
  accessibilityLabelKey: 'stats.trendUp' | 'stats.trendDown' | 'stats.trendNeutral';
};

export function trendVisualForPercent(trendPercent: number): TrendVisual {
  if (trendPercent > 0) {
    return {
      icon: IconTrendingUp,
      color: colors.green,
      accessibilityLabelKey: 'stats.trendUp',
    };
  }

  if (trendPercent < 0) {
    return {
      icon: IconTrendingDown,
      color: colors.amber,
      accessibilityLabelKey: 'stats.trendDown',
    };
  }

  return {
    icon: IconMinus,
    color: colors.textMuted,
    accessibilityLabelKey: 'stats.trendNeutral',
  };
}

export function trendAccessibilityLabel(locale: AppLocale, trendPercent: number) {
  const key = trendVisualForPercent(trendPercent).accessibilityLabelKey;

  return translate(locale, key, {
    values: {
      percent: Math.abs(trendPercent),
    },
  });
}
