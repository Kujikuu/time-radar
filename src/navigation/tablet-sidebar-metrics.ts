import { useLayoutProfile } from '@/src/hooks/use-layout-profile';
import { spacing } from '@/src/theme';

export const SIDEBAR_WIDTH_RAIL = 88;
export const SIDEBAR_WIDTH_LABELED = 240;

export function useSidebarWidth() {
  const { isWide, width } = useLayoutProfile();

  if (!isWide) {
    return 0;
  }

  return width >= 1000 ? SIDEBAR_WIDTH_LABELED : SIDEBAR_WIDTH_RAIL;
}

export function useTabScreenInsets() {
  const { isWide } = useLayoutProfile();

  return {
    paddingBottom: isWide ? spacing.xxl : 100,
  };
}
