import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { colors, radius, shadows } from '@/src/theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type IconButtonProps = {
  name: IconName;
  onPress?: () => void;
  color?: string;
  size?: number;
  style?: ViewStyle | ViewStyle[];
  label: string;
};

export function IconButton({
  name,
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
      <MaterialCommunityIcons name={name} color={color} size={size} />
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
    ...shadows.small,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
});
