import type { AppTextDirection } from '@/src/i18n';

export type BottomTabRouteName = 'index' | 'tasks' | 'stats' | 'settings';

const ltrTabOrder: BottomTabRouteName[] = ['index', 'tasks', 'stats', 'settings'];

export function bottomTabRouteOrder(direction: AppTextDirection): BottomTabRouteName[] {
  return direction === 'rtl' ? [...ltrTabOrder].reverse() : ltrTabOrder;
}
