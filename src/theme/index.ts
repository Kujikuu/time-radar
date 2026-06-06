import { Platform } from 'react-native';

export const colors = {
  background: '#F8F4EF',
  backgroundWarm: '#FCF8F4',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F1EC',
  surfacePeach: '#FFF0EA',
  border: '#EFE5DC',
  borderStrong: '#E8D9CF',
  text: '#1F1A17',
  textMuted: '#766D67',
  textSoft: '#9B918A',
  accent: '#F47E61',
  accentDark: '#DD5C3F',
  accentSoft: '#FFD9CC',
  amber: '#D88415',
  green: '#7CA57F',
  greenSoft: '#DCE9D9',
  blue: '#91B8D1',
  blueSoft: '#DDECF3',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const typography = {
  family: Platform.select({
    ios: 'Poppins',
    android: 'Poppins',
    default: 'Poppins, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  }),
  size: {
    micro: 10,
    eyebrow: 11,
    caption: 12,
    small: 13,
    control: 14,
    body: 15,
    bodyLarge: 16,
    subheading: 17,
    cardTitle: 18,
    title: 20,
    heading: 22,
    screenTitle: 26,
    hero: 30,
    metric: 32,
    stat: 34,
    timer: 44,
  },
  lineHeight: {
    tight: 16,
    caption: 17,
    helper: 18,
    body: 19,
    paragraph: 20,
    button: 21,
    title: 24,
    hero: 26,
    timer: 52,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extraBold: '800',
  },
} as const;
