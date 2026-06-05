import { getLocales } from 'expo-localization';

import type { AppLanguagePreference } from '@/src/features/focus/types';

import { defaultLocale, resolveAppLocale } from './index';

export function getDeviceAppLocale(preference: AppLanguagePreference = 'system') {
  try {
    return resolveAppLocale(getLocales(), preference);
  } catch {
    return defaultLocale;
  }
}
