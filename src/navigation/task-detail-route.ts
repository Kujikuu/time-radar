import type { Href } from 'expo-router';
import { Dimensions, Platform } from 'react-native';

import { resolveLayoutProfile } from '@/src/hooks/use-layout-profile';

export function isWideLayout(width: number) {
  return resolveLayoutProfile(width) === 'wide';
}

export function taskDetailHref(taskId: string, width: number): Href {
  if (isWideLayout(width)) {
    return `/(tabs)/tasks/${taskId}` as Href;
  }

  return `/session/${taskId}` as Href;
}

export function resolveNotificationHref(url: string, width: number): Href {
  const sessionMatch = url.match(/^\/session\/([^/?#]+)$/);

  if (sessionMatch) {
    return taskDetailHref(sessionMatch[1], width);
  }

  return url as Href;
}

export function currentLayoutWidth() {
  return Dimensions.get('window').width;
}

export function isTabletDevice() {
  return Platform.OS === 'ios' ? Platform.isPad : currentLayoutWidth() >= 600;
}
