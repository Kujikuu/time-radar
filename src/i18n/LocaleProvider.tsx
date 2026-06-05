import { useLocales } from 'expo-localization';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';

import type { AppLanguagePreference } from '@/src/features/focus/types';
import {
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
  languagePreference: AppLanguagePreference;
  setLanguagePreference: (preference: AppLanguagePreference) => void;
  t: ReturnType<typeof translateForLocale>;
  formatDate: ReturnType<typeof formatDateForLocale>;
  formatDuration: ReturnType<typeof formatDurationForLocale>;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  direction: textDirectionForLocale(defaultLocale),
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

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      direction,
      languagePreference,
      setLanguagePreference,
      t: translateForLocale(locale),
      formatDate: formatDateForLocale(locale),
      formatDuration: formatDurationForLocale(locale),
    }),
    [direction, languagePreference, locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
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
