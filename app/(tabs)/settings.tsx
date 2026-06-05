import {
  IconMinus,
  IconPlus,
} from '@tabler/icons-react-native';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { AppIcon, PrimaryButton, Screen, SoftCard, type TablerIcon } from '@/src/components';
import { triggerFocusHaptic } from '@/src/features/focus/haptics';
import { useNotificationPermissionStatus, useSettings } from '@/src/features/focus/hooks';
import { notificationStatusLabel } from '@/src/features/focus/notifications';
import { colors, radius, spacing, typography } from '@/src/theme';

export default function SettingsScreen() {
  const { settings, save } = useSettings();
  const notificationPermission = useNotificationPermissionStatus();
  const notificationsAvailable = notificationPermission.status === 'granted';
  const notificationsBlocked = notificationPermission.status === 'denied';
  const notificationsUnsupported = notificationPermission.status === 'unsupported';
  const canRequestNotifications = notificationPermission.status === 'undetermined';

  const enableNotifications = async () => {
    const status =
      notificationPermission.status === 'granted'
        ? 'granted'
        : await notificationPermission.request();

    triggerFocusHaptic(settings, status === 'granted' ? 'start' : 'selection');
    await save({ notificationsEnabled: status === 'granted' });
  };

  const setNotificationsEnabled = async (enabled: boolean) => {
    triggerFocusHaptic(settings, 'selection');

    if (!enabled) {
      await save({ notificationsEnabled: false });
      return;
    }

    await enableNotifications();
  };

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <SettingsSection title="Timer Defaults">
        <StepperRow
          label="Focus"
          helper="Default length for new focus tasks."
          value={settings.defaultFocusMinutes}
          suffix="min"
          min={5}
          max={180}
          step={5}
          onChange={(defaultFocusMinutes) => {
            triggerFocusHaptic(settings, 'selection');
            save({ defaultFocusMinutes });
          }}
        />
        <Divider />
        <StepperRow
          label="Short Break"
          helper="The quick reset between focus sessions."
          value={settings.defaultShortBreakMinutes}
          suffix="min"
          min={1}
          max={60}
          step={1}
          onChange={(defaultShortBreakMinutes) => {
            triggerFocusHaptic(settings, 'selection');
            save({ defaultShortBreakMinutes });
          }}
        />
        <Divider />
        <StepperRow
          label="Long Break"
          helper="Recovery time after a full cycle."
          value={settings.defaultLongBreakMinutes}
          suffix="min"
          min={5}
          max={120}
          step={5}
          onChange={(defaultLongBreakMinutes) => {
            triggerFocusHaptic(settings, 'selection');
            save({ defaultLongBreakMinutes });
          }}
        />
        <Divider />
        <StepperRow
          label="Long Break After"
          helper="Number of focus sessions before a long break."
          value={settings.defaultSessions}
          suffix="sessions"
          min={1}
          max={12}
          step={1}
          onChange={(defaultSessions) => {
            triggerFocusHaptic(settings, 'selection');
            save({ defaultSessions });
          }}
        />
      </SettingsSection>

      <SettingsSection title="Automation">
        <SwitchRow
          label="Auto Start Breaks"
          helper="Start break phases automatically after focus."
          value={settings.autoStartBreaks}
          onValueChange={(autoStartBreaks) => {
            triggerFocusHaptic(settings, 'selection');
            save({ autoStartBreaks });
          }}
        />
        <Divider />
        <SwitchRow
          label="Haptic Feedback"
          helper="Use subtle taps for timer start, pause, reset, and completion."
          value={settings.hapticsEnabled}
          onValueChange={(hapticsEnabled) => {
            triggerFocusHaptic(hapticsEnabled || settings.hapticsEnabled, hapticsEnabled ? 'start' : 'selection');
            save({ hapticsEnabled });
          }}
        />
      </SettingsSection>

      <SettingsSection
        title="Notifications"
        badge={notificationStatusLabel(notificationPermission.status)}>
        <View style={styles.permissionPanel}>
          <View style={styles.permissionCopy}>
            <Text style={styles.permissionTitle}>
              {notificationsAvailable ? 'Completion alerts are ready' : 'Enable timer alerts'}
            </Text>
            <Text style={styles.helper}>
              {notificationsBlocked
                ? 'Notifications are blocked in system settings. TimeRadar cannot schedule alerts until they are allowed.'
                : notificationsUnsupported
                  ? 'Local notifications are not available in the web preview.'
                  : 'TimeRadar can alert you when a focus or break phase finishes.'}
            </Text>
          </View>
          {canRequestNotifications ? (
            <PrimaryButton style={styles.permissionButton} onPress={enableNotifications}>
              Allow
            </PrimaryButton>
          ) : null}
        </View>

        <Divider />
        <SwitchRow
          label="Timer Alerts"
          helper="Schedule a local alert for the active timer."
          value={settings.notificationsEnabled && notificationsAvailable}
          disabled={notificationsBlocked || notificationsUnsupported}
          onValueChange={setNotificationsEnabled}
        />
        <Divider />
        <SwitchRow
          label="Focus Complete"
          helper="Notify when a focus phase finishes."
          value={settings.focusCompleteNotificationsEnabled}
          disabled={!settings.notificationsEnabled || !notificationsAvailable}
          onValueChange={(focusCompleteNotificationsEnabled) => {
            triggerFocusHaptic(settings, 'selection');
            save({ focusCompleteNotificationsEnabled });
          }}
        />
        <Divider />
        <SwitchRow
          label="Break Complete"
          helper="Notify when short or long breaks finish."
          value={settings.breakCompleteNotificationsEnabled}
          disabled={!settings.notificationsEnabled || !notificationsAvailable}
          onValueChange={(breakCompleteNotificationsEnabled) => {
            triggerFocusHaptic(settings, 'selection');
            save({ breakCompleteNotificationsEnabled });
          }}
        />
        <Divider />
        <SwitchRow
          label="Focus Warning"
          helper="Show a quiet reminder before focus ends."
          value={settings.timerWarningEnabled}
          disabled={!settings.notificationsEnabled || !notificationsAvailable}
          onValueChange={(timerWarningEnabled) => {
            triggerFocusHaptic(settings, 'selection');
            save({ timerWarningEnabled });
          }}
        />
        {settings.timerWarningEnabled ? (
          <>
            <Divider />
            <StepperRow
              label="Warning Time"
              helper="How early the focus warning appears."
              value={settings.timerWarningSeconds}
              suffix="sec"
              min={30}
              max={600}
              step={30}
              disabled={!settings.notificationsEnabled || !notificationsAvailable}
              onChange={(timerWarningSeconds) => {
                triggerFocusHaptic(settings, 'selection');
                save({ timerWarningSeconds });
              }}
            />
          </>
        ) : null}
      </SettingsSection>

      <SettingsSection title="Completion Sound">
        <SwitchRow
          label="System Sound"
          helper="Use the device notification sound when a timer alert appears. Silent mode and Focus modes can still suppress it."
          value={settings.completionSoundEnabled}
          disabled={!settings.notificationsEnabled || !notificationsAvailable}
          onValueChange={(completionSoundEnabled) => {
            triggerFocusHaptic(settings, 'selection');
            save({ completionSoundEnabled });
          }}
        />
      </SettingsSection>

    </Screen>
  );
}

function SettingsSection({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <SoftCard style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </SoftCard>
  );
}

function StepperRow({
  label,
  helper,
  value,
  suffix,
  min,
  max,
  step,
  disabled = false,
  onChange,
}: {
  label: string;
  helper: string;
  value: number;
  suffix: string;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <View style={[styles.controlRow, disabled && styles.disabled]}>
      <View style={styles.controlCopy}>
        <Text style={styles.rowTitle}>{label}</Text>
        <Text style={styles.helper}>{helper}</Text>
      </View>
      <View style={styles.stepper}>
        <StepperButton
          label={`Decrease ${label}`}
          icon={IconMinus}
          disabled={!canDecrease}
          onPress={() => onChange(Math.max(min, value - step))}
        />
        <View style={styles.stepperValue}>
          <Text style={styles.stepperNumber}>{value}</Text>
          <Text style={styles.stepperSuffix}>{suffix}</Text>
        </View>
        <StepperButton
          label={`Increase ${label}`}
          icon={IconPlus}
          disabled={!canIncrease}
          onPress={() => onChange(Math.min(max, value + step))}
        />
      </View>
    </View>
  );
}

function StepperButton({
  label,
  icon,
  disabled,
  onPress,
}: {
  label: string;
  icon: TablerIcon;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.stepperButton,
        disabled && styles.stepperButtonDisabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <AppIcon icon={icon} size={18} color={disabled ? colors.textSoft : colors.accentDark} />
    </Pressable>
  );
}

function SwitchRow({
  label,
  helper,
  value,
  disabled = false,
  onValueChange,
}: {
  label: string;
  helper: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={[styles.controlRow, disabled && styles.disabled]}>
      <View style={styles.controlCopy}>
        <Text style={styles.rowTitle}>{label}</Text>
        <Text style={styles.helper}>{helper}</Text>
      </View>
      <Switch
        accessibilityLabel={label}
        accessibilityState={{ disabled, checked: value }}
        disabled={disabled}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.borderStrong, true: colors.accentSoft }}
        thumbColor={value ? colors.accent : colors.surface}
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingBottom: 112,
  },
  header: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 24,
    fontWeight: '600',
  },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionHeader: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    overflow: 'hidden',
    borderRadius: radius.pill,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.backgroundWarm,
  },
  sectionBody: {
    gap: 0,
  },
  controlRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  controlCopy: {
    flex: 1,
    gap: 3,
    paddingRight: spacing.sm,
  },
  rowTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 14,
    fontWeight: '700',
  },
  helper: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 12,
    lineHeight: 18,
  },
  stepper: {
    minWidth: 136,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.pill,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.backgroundWarm,
  },
  stepperButton: {
    width: 40,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonDisabled: {
    opacity: 0.42,
  },
  stepperValue: {
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperNumber: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  stepperSuffix: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 10,
    fontWeight: '700',
    marginTop: -2,
  },
  permissionPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  permissionCopy: {
    flex: 1,
    gap: 3,
  },
  permissionTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 14,
    fontWeight: '700',
  },
  permissionButton: {
    minHeight: 42,
    minWidth: 86,
    paddingHorizontal: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  disabled: {
    opacity: 0.52,
  },
  pressed: {
    opacity: 0.76,
  },
});
