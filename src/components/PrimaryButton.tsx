import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { rowDirectionForTextDirection } from '@/src/i18n';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { colors, radius, typography } from '@/src/theme';

import { AppText } from './AppText';

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
  const { direction, nativeDirection } = useLocale();
  const resolvedAccessibilityLabel =
    accessibilityLabel ?? (typeof children === 'string' ? children : undefined);
  const buttonDirection = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };

  return (
    <Pressable
      accessibilityLabel={resolvedAccessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        buttonDirection,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      <AppText style={styles.label}>{children}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 0,
    minHeight: 54,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
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
    flexShrink: 1,
    color: colors.white,
    fontFamily: typography.family,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.button,
    textAlign: 'center',
  },
});
