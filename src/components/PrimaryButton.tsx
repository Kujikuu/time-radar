import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, typography } from '@/src/theme';

type PrimaryButtonProps = PropsWithChildren<{
  accessibilityLabel?: string;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
}>;

export function PrimaryButton({
  accessibilityLabel,
  children,
  disabled = false,
  onPress,
  style,
}: PrimaryButtonProps) {
  const resolvedAccessibilityLabel =
    accessibilityLabel ?? (typeof children === 'string' ? children : undefined);

  return (
    <Pressable
      accessibilityLabel={resolvedAccessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
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
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: colors.white,
    fontFamily: typography.family,
    fontSize: 16,
    fontWeight: '700',
  },
});
