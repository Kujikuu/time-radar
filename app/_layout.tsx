import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { type Href, router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { DATABASE_NAME, migrateDatabase } from '@/src/features/focus/database';
import { getSettings } from '@/src/features/focus/repository';
import { LocaleProvider, useLocale } from '@/src/i18n/LocaleProvider';
import { colors } from '@/src/theme';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.setOptions({
  duration: 450,
  fade: true,
});

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins: Poppins_400Regular,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    'Thmanyah Sans': require('../assets/fonts/thmanyahsans/thmanyahsans-Regular.otf'),
    'Thmanyah Sans Medium': require('../assets/fonts/thmanyahsans/thmanyahsans-Medium.otf'),
    'Thmanyah Sans Bold': require('../assets/fonts/thmanyahsans/thmanyahsans-Bold.otf'),
    'Thmanyah Sans Black': require('../assets/fonts/thmanyahsans/thmanyahsans-Black.otf'),
  });

  useTimerNotificationObserver();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.background,
      primary: colors.accent,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <LocaleProvider>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase}>
          <LanguagePreferenceSync />
          <Stack initialRouteName="index">
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="session/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="task/new" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="dark" backgroundColor={colors.background} />
        </SQLiteProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}

function LanguagePreferenceSync() {
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

function useTimerNotificationObserver() {
  useEffect(() => {
    function redirectFromNotification(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;

      if (typeof url === 'string') {
        router.push(url as Href);
      }
    }

    try {
      const lastResponse = Notifications.getLastNotificationResponse();

      if (lastResponse?.notification) {
        redirectFromNotification(lastResponse.notification);
        Notifications.clearLastNotificationResponse();
      }
    } catch {
      // Expo Notifications is unavailable on web and some preview runtimes.
    }

    let subscription: ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null =
      null;

    try {
      subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        redirectFromNotification(response.notification);
      });
    } catch {
      // Expo Notifications is unavailable on web and some preview runtimes.
    }

    return () => {
      subscription?.remove();
    };
  }, []);
}
