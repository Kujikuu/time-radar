import { Platform } from 'react-native';

import type { TimerWidgetInput } from './types';
import { formatTimerWidgetData } from './timer-widget-data';

const ANDROID_WIDGET_PACKAGE = 'com.afifistudio.timeradar';
const ANDROID_WIDGET_DATA_KEY = 'widgetdata';

let setAndroidWidgetDataFn: ((data: string, packageName?: string) => void) | null = null;

async function loadAndroidSetWidgetData() {
  if (setAndroidWidgetDataFn) {
    return setAndroidWidgetDataFn;
  }

  if (Platform.OS !== 'android') {
    return null;
  }

  try {
    const mod = await import('@bittingz/expo-widgets');
    setAndroidWidgetDataFn = mod.setWidgetData;
    return setAndroidWidgetDataFn;
  } catch {
    return null;
  }
}

async function syncTimerToIosWidget(input: TimerWidgetInput | null): Promise<void> {
  const data = formatTimerWidgetData(input);

  try {
    // Expo/Metro resolves this TSX module; the Node16 test compiler requires JS extensions.
    // @ts-ignore
    const { EMPTY_TIMER_WIDGET_DATA, FocusTimerWidget } = await import('./focus-timer-widget');
    FocusTimerWidget.updateSnapshot(data ?? EMPTY_TIMER_WIDGET_DATA);
  } catch {
    // Widget sync should never block the in-app timer experience.
  }
}

async function syncTimerToAndroidWidget(input: TimerWidgetInput | null): Promise<void> {
  const fn = await loadAndroidSetWidgetData();

  if (!fn) {
    return;
  }

  const data = formatTimerWidgetData(input);
  const serialized = data ? JSON.stringify(data) : '';
  const packageName = ANDROID_WIDGET_PACKAGE;

  try {
    fn(serialized, packageName);
  } catch {
    // Widget sync should never block the in-app timer experience.
  }
}

export async function syncTimerToWidget(input: TimerWidgetInput | null): Promise<void> {
  if (Platform.OS === 'ios') {
    await syncTimerToIosWidget(input);
    return;
  }

  if (Platform.OS === 'android') {
    await syncTimerToAndroidWidget(input);
  }
}

export async function clearWidgetData(): Promise<void> {
  await syncTimerToWidget(null);
}

export { ANDROID_WIDGET_DATA_KEY, ANDROID_WIDGET_PACKAGE };
