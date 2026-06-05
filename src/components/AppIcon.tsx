import { ComponentType } from 'react';
import { ColorValue } from 'react-native';
import { SvgProps } from 'react-native-svg';

export type TablerIcon = ComponentType<
  SvgProps & {
    color?: ColorValue;
    size?: string | number;
    strokeWidth?: string | number;
  }
>;

type AppIconProps = {
  icon: TablerIcon;
  color: ColorValue;
  size?: number;
  strokeWidth?: number;
  style?: SvgProps['style'];
};

export function AppIcon({ icon: Icon, color, size = 24, strokeWidth = 1.9, style }: AppIconProps) {
  return <Icon color={color} size={size} strokeWidth={strokeWidth} style={style} />;
}
