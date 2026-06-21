import { IconX } from '@tabler/icons-react-native';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import { useEffect, useRef } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/src/components';
import { rowDirectionForTextDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, spacing } from '@/src/theme';

import { lockDefaultOrientation, lockLandscapeOrientation } from './orientation';
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
  const { direction, nativeDirection, t } = useTranslation();
  const chromeRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };

  useKeepAwake('time-radar-immersive-timer');

  useEffect(() => {
    void lockLandscapeOrientation();

    return () => {
      void lockDefaultOrientation();
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
        <View style={[styles.chrome, chromeRow]}>
          <IconButton
            icon={IconX}
            label={t('timer.actions.closeFullscreen')}
            onPress={onExit}
            color={colors.text}
            style={styles.closeButton}
          />
        </View>
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
  chrome: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  closeButton: {
    backgroundColor: colors.surfaceMuted,
  },
  surface: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
