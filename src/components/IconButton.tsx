import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { colors, radius } from '@/src/theme';

import { AppIcon, TablerIcon } from './AppIcon';

type IconButtonProps = {
  icon: TablerIcon;
  onPress?: () => void;
  color?: string;
  disabled?: boolean;
  size?: number;
  style?: ViewStyle | ViewStyle[];
  label: string;
};

export function IconButton({
  icon,
  onPress,
  color = colors.text,
  disabled = false,
  size = 22,
  style,
  label,
}: IconButtonProps) {
  const isDisabled = disabled || !onPress;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}>
      <AppIcon icon={icon} color={color} size={size} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
