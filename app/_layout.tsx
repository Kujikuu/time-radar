import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { DATABASE_NAME, migrateDatabase } from '@/src/features/focus/database';
import { lockDefaultOrientation } from '@/src/features/focus/orientation';
import { LanguagePreferenceSync } from '@/src/i18n/LanguagePreferenceSync';
import { LocaleProvider } from '@/src/i18n/LocaleProvider';
import { useTimerNotificationObserver } from '@/src/navigation/use-timer-notification-observer';
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
  const { width } = useWindowDimensions();
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

  useTimerNotificationObserver(width);

  useEffect(() => {
    void lockDefaultOrientation();
  }, []);

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
    <GestureHandlerRootView style={styles.gestureRoot}>
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
            <StatusBar style="dark" />
          </SQLiteProvider>
        </LocaleProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
});
