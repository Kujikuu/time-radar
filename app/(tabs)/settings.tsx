import {
  IconLanguage,
  IconMinus,
  IconPlus,
} from '@tabler/icons-react-native';
import { type ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, Switch, View } from 'react-native';

import {
  AppIcon,
  AppText,
  IconButton,
  PrimaryButton,
  Screen,
  SoftCard,
  type TablerIcon,
} from '@/src/components';
import { triggerFocusHaptic } from '@/src/features/focus/haptics';
import { useNotificationPermissionStatus, useSettings } from '@/src/features/focus/hooks';
import {
  languageTogglePreferenceForLocale,
  rowDirectionForTextDirection,
  textAlignForTextDirection,
} from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, spacing, typography } from '@/src/theme';

export default function SettingsScreen() {
  const { settings, save } = useSettings();
  const notificationPermission = useNotificationPermissionStatus();
  const { direction, locale, nativeDirection, setLanguagePreference, t } = useTranslation();
  const notificationsAvailable = notificationPermission.status === 'granted';
  const notificationsBlocked = notificationPermission.status === 'denied';
  const notificationsUnsupported = notificationPermission.status === 'unsupported';
  const canRequestNotifications = notificationPermission.status === 'undetermined';
  const languageToggleLabel =
    locale === 'ar' ? t('settings.switchToEnglish') : t('settings.switchToArabic');
  const tileText = { textAlign: textAlignForTextDirection(direction) };
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };

  const enableNotifications = async () => {
    const status =
      notificationPermission.status === 'granted'
        ? 'granted'
        : await notificationPermission.request();

    triggerFocusHaptic(settings, status === 'granted' ? 'start' : 'selection');
    await save({ notificationsEnabled: status === 'granted' });
  };

  const openSystemSettings = () => {
    Linking.openSettings().catch(() => undefined);
  };

  const setNotificationsEnabled = async (enabled: boolean) => {
    triggerFocusHaptic(settings, 'selection');

    if (!enabled) {
      await save({ notificationsEnabled: false });
      return;
    }

    await enableNotifications();
  };

  const updateLanguagePreference = async () => {
    const languagePreference = languageTogglePreferenceForLocale(locale);

    triggerFocusHaptic(settings, 'selection');
    setLanguagePreference(languagePreference);
    await save({ languagePreference });
  };

  return (
    <Screen contentStyle={styles.screen}>
      <View style={[styles.header, contentRow]}>
        <AppText style={[styles.title, tileText]}>{t('settings.title')}</AppText>
        <IconButton
          icon={IconLanguage}
          label={languageToggleLabel}
          onPress={updateLanguagePreference}
          color={colors.accentDark}
          style={styles.languageButton}
        />
      </View>

      <SettingsSection title={t('settings.timerDefaults')}>
        <StepperRow
          label={t('settings.focus')}
          helper={t('settings.focusHelper')}
          value={settings.defaultFocusMinutes}
          suffix={t('units.min')}
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
          label={t('settings.shortBreak')}
          helper={t('settings.shortBreakHelper')}
          value={settings.defaultShortBreakMinutes}
          suffix={t('units.min')}
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
          label={t('settings.longBreak')}
          helper={t('settings.longBreakHelper')}
          value={settings.defaultLongBreakMinutes}
          suffix={t('units.min')}
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
          label={t('settings.longBreakAfter')}
          helper={t('settings.longBreakAfterHelper')}
          value={settings.defaultSessions}
          suffix={t('units.sessions')}
          min={1}
          max={12}
          step={1}
          onChange={(defaultSessions) => {
            triggerFocusHaptic(settings, 'selection');
            save({ defaultSessions });
          }}
        />
      </SettingsSection>

      <SettingsSection title={t('settings.automation')}>
        <SwitchRow
          label={t('settings.autoStartBreaks')}
          helper={t('settings.autoStartBreaksHelper')}
          value={settings.autoStartBreaks}
          onValueChange={(autoStartBreaks) => {
            triggerFocusHaptic(settings, 'selection');
            save({ autoStartBreaks });
          }}
        />
        <Divider />
        <SwitchRow
          label={t('settings.hapticFeedback')}
          helper={t('settings.hapticFeedbackHelper')}
          value={settings.hapticsEnabled}
          onValueChange={(hapticsEnabled) => {
            triggerFocusHaptic(hapticsEnabled || settings.hapticsEnabled, hapticsEnabled ? 'start' : 'selection');
            save({ hapticsEnabled });
          }}
        />
      </SettingsSection>

      <SettingsSection
        title={t('settings.notifications')}
        badge={t(`settings.permissionStatus.${notificationPermission.status}`)}>
        <View style={[styles.permissionPanel, contentRow]}>
          <View style={styles.permissionCopy}>
            <AppText style={[styles.permissionTitle, styles.tileText, tileText]}>
              {notificationsAvailable
                ? t('settings.notificationsReady')
                : t('settings.notificationsEnable')}
            </AppText>
            <AppText style={[styles.helper, styles.tileText, tileText]}>
              {notificationsBlocked
                ? t('settings.notificationsBlocked')
                : notificationsUnsupported
                  ? t('settings.notificationsUnsupported')
                  : t('settings.notificationsAvailable')}
            </AppText>
          </View>
          {canRequestNotifications ? (
            <PrimaryButton style={styles.permissionButton} onPress={enableNotifications}>
              {t('settings.allow')}
            </PrimaryButton>
          ) : null}
          {notificationsBlocked ? (
            <PrimaryButton style={styles.systemSettingsButton} onPress={openSystemSettings}>
              {t('common.openSystemSettings')}
            </PrimaryButton>
          ) : null}
        </View>

        <Divider />
        <SwitchRow
          label={t('settings.timerAlerts')}
          helper={t('settings.timerAlertsHelper')}
          value={settings.notificationsEnabled && notificationsAvailable}
          disabled={notificationsBlocked || notificationsUnsupported}
          onValueChange={setNotificationsEnabled}
        />
        <Divider />
        <SwitchRow
          label={t('settings.focusComplete')}
          helper={t('settings.focusCompleteHelper')}
          value={settings.focusCompleteNotificationsEnabled}
          disabled={!settings.notificationsEnabled || !notificationsAvailable}
          onValueChange={(focusCompleteNotificationsEnabled) => {
            triggerFocusHaptic(settings, 'selection');
            save({ focusCompleteNotificationsEnabled });
          }}
        />
        <Divider />
        <SwitchRow
          label={t('settings.breakComplete')}
          helper={t('settings.breakCompleteHelper')}
          value={settings.breakCompleteNotificationsEnabled}
          disabled={!settings.notificationsEnabled || !notificationsAvailable}
          onValueChange={(breakCompleteNotificationsEnabled) => {
            triggerFocusHaptic(settings, 'selection');
            save({ breakCompleteNotificationsEnabled });
          }}
        />
        <Divider />
        <SwitchRow
          label={t('settings.focusWarning')}
          helper={t('settings.focusWarningHelper')}
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
              label={t('settings.warningTime')}
              helper={t('settings.warningTimeHelper')}
              value={settings.timerWarningSeconds}
              suffix={t('units.sec')}
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

      <SettingsSection title={t('settings.completionSound')}>
        <SwitchRow
          label={t('settings.systemSound')}
          helper={t('settings.systemSoundHelper')}
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
  const { direction, nativeDirection } = useTranslation();
  const tileText = { textAlign: textAlignForTextDirection(direction) };
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };

  return (
    <SoftCard style={styles.card}>
      <View style={[styles.sectionHeader, contentRow]}>
        <View style={styles.sectionTitleWrap}>
          <AppText style={[styles.sectionTitle, styles.tileText, tileText]}>{title}</AppText>
        </View>
        {badge ? <AppText style={styles.badge}>{badge}</AppText> : null}
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
  const { direction, nativeDirection, t } = useTranslation();
  const tileText = { textAlign: textAlignForTextDirection(direction) };
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };

  return (
    <View style={[styles.controlRow, contentRow, disabled && styles.disabled]}>
      <View style={styles.controlCopy}>
        <AppText style={[styles.rowTitle, styles.tileText, tileText]}>{label}</AppText>
        <AppText style={[styles.helper, styles.tileText, tileText]}>{helper}</AppText>
      </View>
      <View style={styles.stepper}>
        <StepperButton
          label={t('settings.decrease', { values: { label } })}
          icon={IconMinus}
          disabled={!canDecrease}
          onPress={() => onChange(Math.max(min, value - step))}
        />
        <View style={styles.stepperValue}>
          <AppText style={styles.stepperNumber}>{value}</AppText>
          <AppText style={styles.stepperSuffix}>{suffix}</AppText>
        </View>
        <StepperButton
          label={t('settings.increase', { values: { label } })}
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
  const { direction, nativeDirection } = useTranslation();
  const tileText = { textAlign: textAlignForTextDirection(direction) };
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };

  return (
    <View style={[styles.controlRow, contentRow, disabled && styles.disabled]}>
      <View style={styles.controlCopy}>
        <AppText style={[styles.rowTitle, styles.tileText, tileText]}>{label}</AppText>
        <AppText style={[styles.helper, styles.tileText, tileText]}>{helper}</AppText>
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
    paddingBottom: 100,
  },
  header: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontFamily: typography.family,
    fontSize: typography.title,
    fontWeight: 'bold',
  },
  languageButton: {
    flexShrink: 0,
    backgroundColor: colors.surfaceMuted,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionHeader: {
    minHeight: 32,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitleWrap: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  sectionTitle: {
    alignSelf: 'stretch',
    flexShrink: 1,
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tileText: {
    minWidth: 0,
  },
  badge: {
    flexShrink: 0,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  controlCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  rowTitle: {
    flexShrink: 1,
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 14,
    fontWeight: '700',
  },
  helper: {
    flexShrink: 1,
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 12,
    lineHeight: 18,
  },
  stepper: {
    minWidth: 136,
    flexShrink: 0,
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
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  permissionCopy: {
    flex: 1,
    minWidth: 0,
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
  systemSettingsButton: {
    minHeight: 42,
    minWidth: 180,
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
