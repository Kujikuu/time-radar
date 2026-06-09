import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import { useEffect, useRef } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/src/theme';

import { lockLandscapeOrientation, lockPortraitOrientation } from './orientation';
import { TimerRing } from './TimerRing';

type ImmersiveTimerViewProps = {
  label: string;
  time: string;
  progress: number;
  primaryActionLabel: string;
  primaryActionState: 'start' | 'pause' | 'resume';
  surfaceAccessibilityLabel: string;
  surfaceAccessibilityHint: string;
  onPrimaryAction: () => void;
  onExit: () => void;
};

const DOUBLE_TAP_THRESHOLD_MS = 320;

export function ImmersiveTimerView({
  label,
  time,
  progress,
  primaryActionLabel,
  primaryActionState,
  surfaceAccessibilityLabel,
  surfaceAccessibilityHint,
  onPrimaryAction,
  onExit,
}: ImmersiveTimerViewProps) {
  const lastTapAtRef = useRef(0);

  useKeepAwake('time-radar-immersive-timer');

  useEffect(() => {
    void lockLandscapeOrientation();

    return () => {
      void lockPortraitOrientation();
    };
  }, []);

  useEffect(() => {
    const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onExit();
      return true;
    });

    return () => {
      backSubscription.remove();
    };
  }, [onExit]);

  const handleSurfacePress = () => {
    const now = Date.now();

    if (now - lastTapAtRef.current <= DOUBLE_TAP_THRESHOLD_MS) {
      lastTapAtRef.current = 0;
      onExit();
      return;
    }

    lastTapAtRef.current = now;
  };

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.surface}>
          <TimerRing
            presentation="immersive"
            label={label}
            time={time}
            progress={progress}
            primaryActionLabel={primaryActionLabel}
            primaryActionState={primaryActionState}
            onPrimaryAction={onPrimaryAction}
            onSurfacePress={handleSurfacePress}
            surfaceAccessibilityLabel={surfaceAccessibilityLabel}
            surfaceAccessibilityHint={surfaceAccessibilityHint}
            showSecondaryActions={false}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  surface: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
