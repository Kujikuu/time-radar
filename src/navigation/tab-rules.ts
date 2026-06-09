import type { AppTextDirection } from '@/src/i18n';

export type BottomTabRouteName = 'index' | 'tasks' | 'stats' | 'settings';

const tabRouteOrder: BottomTabRouteName[] = ['index', 'tasks', 'stats', 'settings'];

export function bottomTabRouteOrder(direction: AppTextDirection): BottomTabRouteName[] {
  return direction === 'rtl' ? [...tabRouteOrder].reverse() : tabRouteOrder;
}

export function sidebarTabRouteOrder(): BottomTabRouteName[] {
  return tabRouteOrder;
}
