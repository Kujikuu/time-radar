import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, shadows, typography } from '@/src/theme';

type PrimaryButtonProps = PropsWithChildren<{
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
}>;

export function PrimaryButton({ children, onPress, style }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}>
      <Text style={styles.label}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    ...shadows.small,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  label: {
    color: colors.white,
    fontFamily: typography.family,
    fontSize: 16,
    fontWeight: '700',
  },
});
