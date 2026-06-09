import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { rowDirectionForTextDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, spacing, typography } from '@/src/theme';

import { AppText } from './AppText';

type ScreenHeaderProps = {
  title: string;
  action?: ReactNode;
  leading?: ReactNode;
  centered?: boolean;
  style?: StyleProp<ViewStyle>;
  titleSize?: 'screen' | 'compact';
};

export function ScreenHeader({
  title,
  action,
  leading,
  centered = false,
  style,
  titleSize = 'screen',
}: ScreenHeaderProps) {
  const { direction, nativeDirection } = useTranslation();
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };
  const edgePlaceholder = centered ? <View style={styles.edgePlaceholder} /> : null;

  return (
    <View style={[styles.header, contentRow, style]}>
      {leading ? <View style={styles.edge}>{leading}</View> : edgePlaceholder}
      <AppText
        numberOfLines={2}
        style={[
          styles.title,
          titleSize === 'compact' ? styles.titleCompact : styles.titleScreen,
          centered && styles.titleCentered,
        ]}>
        {title}
      </AppText>
      {action ? <View style={styles.edge}>{action}</View> : edgePlaceholder}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontWeight: typography.weight.bold,
  },
  titleScreen: {
    fontSize: typography.size.screenTitle,
  },
  titleCompact: {
    fontSize: typography.size.title,
  },
  titleCentered: {
    textAlign: 'center',
  },
  edge: {
    flexShrink: 0,
  },
  edgePlaceholder: {
    width: 44,
    flexShrink: 0,
  },
});
