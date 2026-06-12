import { NativeModules, Platform } from 'react-native';

import type { TimerWidgetInput } from './types';
import { formatTimerWidgetData } from './timer-widget-data';

const ANDROID_WIDGET_PACKAGE = 'com.afifistudio.timeradar';
const ANDROID_WIDGET_DATA_KEY = 'widgetdata';

type TimerRadarWidgetNativeModule = {
  setWidgetData: (data: string, packageName?: string) => void;
};

function getAndroidWidgetModule(): TimerRadarWidgetNativeModule | null {
  return (NativeModules.TimerRadarWidget as TimerRadarWidgetNativeModule | undefined) ?? null;
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
  const widgetModule = getAndroidWidgetModule();

  if (!widgetModule) {
    return;
  }

  const data = formatTimerWidgetData(input);
  const serialized = data ? JSON.stringify(data) : '';
  const packageName = ANDROID_WIDGET_PACKAGE;

  try {
    widgetModule.setWidgetData(serialized, packageName);
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
