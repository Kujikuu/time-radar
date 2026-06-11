import { Platform } from 'react-native';

import type { TimerWidgetInput } from './types';
import { formatTimerWidgetData } from './timer-widget-data';

const WIDGET_DATA_KEY = 'timer-widget-data';
const SUITE_NAME = 'group.com.sniper.timeradar';

let userDefaults: typeof import('@bittingz/expo-widgets').UserDefaults | null = null;

async function getUserDefaults() {
  if (userDefaults) {
    return userDefaults;
  }

  if (Platform.OS !== 'ios') {
    return null;
  }

  try {
    const { UserDefaults } = await import('@bittingz/expo-widgets');
    userDefaults = UserDefaults;
    return userDefaults;
  } catch {
    return null;
  }
}

export async function syncTimerToWidget(input: TimerWidgetInput | null): Promise<void> {
  const defaults = await getUserDefaults();
  if (!defaults) {
    return;
  }
  const data = formatTimerWidgetData(input);
  const serialized = data ? JSON.stringify(data) : null;
  defaults.setString(suiteName, WIDGET_DATA_KEY, serialized ?? '');
}

export async function clearWidgetData(): Promise<void> {
  const defaults = await getUserDefaults();
  if (!defaults) {
    return;
  }
  defaults.setString(suiteName, WIDGET_DATA_KEY, '');
}
