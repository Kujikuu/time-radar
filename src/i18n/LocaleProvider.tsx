import { useLocales } from 'expo-localization';
import { createContext, type PropsWithChildren, use, useMemo, useState } from 'react';
import { I18nManager, Platform } from 'react-native';

import type { AppLanguagePreference } from '@/src/features/focus/types';
import {
  type AppTextDirection,
  type AppLocale,
  defaultLocale,
  formatAppDate,
  formatDuration,
  resolveAppLocale,
  textDirectionForLocale,
  translate,
} from './index';

type LocaleContextValue = {
  locale: AppLocale;
  direction: ReturnType<typeof textDirectionForLocale>;
  nativeDirection: AppTextDirection;
  languagePreference: AppLanguagePreference;
  setLanguagePreference: (preference: AppLanguagePreference) => void;
  t: ReturnType<typeof translateForLocale>;
  formatDate: ReturnType<typeof formatDateForLocale>;
  formatDuration: ReturnType<typeof formatDurationForLocale>;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  direction: textDirectionForLocale(defaultLocale),
  nativeDirection:
    Platform.OS === 'web'
      ? textDirectionForLocale(defaultLocale)
      : I18nManager.isRTL
        ? 'rtl'
        : 'ltr',
  languagePreference: 'system',
  setLanguagePreference: () => undefined,
  t: translateForLocale(defaultLocale),
  formatDate: formatDateForLocale(defaultLocale),
  formatDuration: formatDurationForLocale(defaultLocale),
});

export function LocaleProvider({ children }: PropsWithChildren) {
  const locales = useLocales();
  const [languagePreference, setLanguagePreference] =
    useState<AppLanguagePreference>('system');
  const locale = resolveAppLocale(locales, languagePreference);
  const direction = textDirectionForLocale(locale);
  const nativeDirection: AppTextDirection =
    Platform.OS === 'web' ? direction : I18nManager.isRTL ? 'rtl' : 'ltr';

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      direction,
      nativeDirection,
      languagePreference,
      setLanguagePreference,
      t: translateForLocale(locale),
      formatDate: formatDateForLocale(locale),
      formatDuration: formatDurationForLocale(locale),
    }),
    [direction, languagePreference, locale, nativeDirection]
  );

  return <LocaleContext value={value}>{children}</LocaleContext>;
}

export function useLocale() {
  return use(LocaleContext);
}

export function useTranslation() {
  return useLocale();
}

function translateForLocale(locale: AppLocale) {
  return (key: string, options?: Parameters<typeof translate>[2]) => translate(locale, key, options);
}

function formatDateForLocale(locale: AppLocale) {
  return (date: Date, options: Intl.DateTimeFormatOptions) => formatAppDate(locale, date, options);
}

function formatDurationForLocale(locale: AppLocale) {
  return (minutes: number) => formatDuration(locale, minutes);
}
