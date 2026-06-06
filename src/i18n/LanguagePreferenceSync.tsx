import { useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { getSettings } from '@/src/features/focus/repository';

import { useLocale } from './LocaleProvider';

export function LanguagePreferenceSync() {
  const db = useSQLiteContext();
  const { setLanguagePreference } = useLocale();

  useEffect(() => {
    let isMounted = true;

    getSettings(db)
      .then((settings) => {
        if (isMounted) {
          setLanguagePreference(settings.languagePreference);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [db, setLanguagePreference]);

  return null;
}
