import { useWindowDimensions } from 'react-native';

export type LayoutProfile = 'compact' | 'regular' | 'wide';

const COMPACT_MAX = 600;
const REGULAR_MAX = 900;

export function resolveLayoutProfile(width: number): LayoutProfile {
  if (width < COMPACT_MAX) {
    return 'compact';
  }

  if (width < REGULAR_MAX) {
    return 'regular';
  }

  return 'wide';
}

export function useLayoutProfile() {
  const { width } = useWindowDimensions();
  const profile = resolveLayoutProfile(width);

  return {
    profile,
    width,
    isCompact: profile === 'compact',
    isRegular: profile === 'regular',
    isWide: profile === 'wide',
    isTablet: width >= COMPACT_MAX,
  };
}
