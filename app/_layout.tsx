import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { type Href, router, Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { DATABASE_NAME, migrateDatabase } from '@/src/features/focus/database';
import { colors } from '@/src/theme';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  useTimerNotificationObserver();

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
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase}>
        <Stack initialRouteName="index">
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="session/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="task/new" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" backgroundColor={colors.background} />
      </SQLiteProvider>
    </ThemeProvider>
  );
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
