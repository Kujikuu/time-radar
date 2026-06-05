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
    ios: 'Avenir Next',
    android: 'sans-serif',
    default: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  }),
  title: 28,
  heading: 22,
  subheading: 17,
  body: 15,
  caption: 12,
};
