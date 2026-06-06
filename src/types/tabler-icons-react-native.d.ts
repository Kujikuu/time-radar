declare module '@tabler/icons-react-native' {
  import { ComponentType } from 'react';
  import { ColorValue } from 'react-native';
  import { SvgProps } from 'react-native-svg';

  export type IconProps = SvgProps & {
    color?: ColorValue;
    size?: string | number;
    strokeWidth?: string | number;
  };

  export const IconChartPie: ComponentType<IconProps>;
  export const IconChartPieFilled: ComponentType<IconProps>;
  export const IconCheck: ComponentType<IconProps>;
  export const IconChevronLeft: ComponentType<IconProps>;
  export const IconChevronRight: ComponentType<IconProps>;
  export const IconClipboardCheck: ComponentType<IconProps>;
  export const IconClock: ComponentType<IconProps>;
  export const IconFileText: ComponentType<IconProps>;
  export const IconFlame: ComponentType<IconProps>;
  export const IconLanguage: ComponentType<IconProps>;
  export const IconListDetails: ComponentType<IconProps>;
  export const IconListDetailsFilled: ComponentType<IconProps>;
  export const IconMinus: ComponentType<IconProps>;
  export const IconPlayerPause: ComponentType<IconProps>;
  export const IconPlayerPlay: ComponentType<IconProps>;
  export const IconPlus: ComponentType<IconProps>;
  export const IconRefresh: ComponentType<IconProps>;
  export const IconSettings: ComponentType<IconProps>;
  export const IconSettingsFilled: ComponentType<IconProps>;
  export const IconSmartHome: ComponentType<IconProps>;
  export const IconTargetArrow: ComponentType<IconProps>;
  export const IconTrendingUp: ComponentType<IconProps>;
}
