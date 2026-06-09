import * as Haptics from 'expo-haptics';

import { AppSettings } from './types';

export type FocusHapticEvent = 'start' | 'pause' | 'reset' | 'complete' | 'selection';

export function triggerFocusHaptic(settings: AppSettings | boolean, event: FocusHapticEvent) {
  const enabled = typeof settings === 'boolean' ? settings : settings.hapticsEnabled;

  if (!enabled || process.env.EXPO_OS !== 'ios') {
    return;
  }

  void runHaptic(event);
}

async function runHaptic(event: FocusHapticEvent) {
  try {
    if (event === 'complete') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    if (event === 'selection' || event === 'pause') {
      await Haptics.selectionAsync();
      return;
    }

    if (event === 'reset') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  } catch {
    // Haptics can be unavailable or suppressed by device settings.
  }
}
