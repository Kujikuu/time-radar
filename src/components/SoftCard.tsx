import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius } from '@/src/theme';

type SoftCardProps = PropsWithChildren<{
  style?: ViewStyle | ViewStyle[];
}>;

export function SoftCard({ children, style }: SoftCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    boxShadow: '0 8px 22px rgba(31, 26, 23, 0.05)',
  },
});
