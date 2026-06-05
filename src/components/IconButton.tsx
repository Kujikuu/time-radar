import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { colors, radius } from '@/src/theme';

import { AppIcon, TablerIcon } from './AppIcon';

type IconButtonProps = {
  icon: TablerIcon;
  onPress?: () => void;
  color?: string;
  size?: number;
  style?: ViewStyle | ViewStyle[];
  label: string;
};

export function IconButton({
  icon,
  onPress,
  color = colors.text,
  size = 22,
  style,
  label,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}>
      <AppIcon icon={icon} color={color} size={size} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
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
});
