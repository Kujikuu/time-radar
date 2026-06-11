import { Platform } from 'react-native';

import type { TimerWidgetInput } from './types';
import { formatTimerWidgetData } from './timer-widget-data';

const WIDGET_DATA_KEY = 'timer-widget-data';
const SUITE_NAME = 'group.com.sniper.timeradar.expowidgets';

let setWidgetDataFn: ((data: string) => void) | null = null;

async function loadSetWidgetData() {
  if (setWidgetDataFn) {
    return setWidgetDataFn;
  }

  if (Platform.OS !== 'ios') {
    return null;
  }

  try {
    const mod = await import('@bittingz/expo-widgets');
    setWidgetDataFn = mod.setWidgetData;
    return setWidgetDataFn;
  } catch {
    return null;
  }
}

export async function syncTimerToWidget(input: TimerWidgetInput | null): Promise<void> {
  const fn = await loadSetWidgetData();

  if (!fn) {
    return;
  }

  const data = formatTimerWidgetData(input);
  const serialized = data ? JSON.stringify(data) : '';
  fn(serialized);
}

export async function clearWidgetData(): Promise<void> {
  const fn = await loadSetWidgetData();

  if (!fn) {
    return;
  }

  fn('');
}

export { SUITE_NAME, WIDGET_DATA_KEY };
