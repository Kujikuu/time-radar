import { Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

async function lockSupportedOrientation(orientationLock: ScreenOrientation.OrientationLock) {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const isSupported = await ScreenOrientation.supportsOrientationLockAsync(orientationLock);

    if (isSupported) {
      await ScreenOrientation.lockAsync(orientationLock);
    }
  } catch {
    // Orientation locks can fail in preview runtimes or unsupported platform states.
  }
}

export function lockPortraitOrientation() {
  return lockSupportedOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP);
}

export function lockLandscapeOrientation() {
  return lockSupportedOrientation(ScreenOrientation.OrientationLock.LANDSCAPE);
}

export function lockDefaultOrientation() {
  if (Platform.OS === 'ios' && Platform.isPad) {
    return lockSupportedOrientation(ScreenOrientation.OrientationLock.DEFAULT);
  }

  return lockPortraitOrientation();
}
