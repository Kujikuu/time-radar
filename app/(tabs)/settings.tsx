import { IconLanguage } from '@tabler/icons-react-native';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Divider,
  IconButton,
  PrimaryButton,
  Screen,
  ScreenHeader,
  SettingsSection,
  StepperRow,
  SwitchRow,
} from '@/src/components';
import { triggerFocusHaptic } from '@/src/features/focus/haptics';
import { useNotificationPermissionStatus, useSettings } from '@/src/features/focus/hooks';
import { useSupporterActions } from '@/src/features/support/use-supporter-actions';
import {
  languageTogglePreferenceForLocale,
  rowDirectionForTextDirection,
  textAlignForTextDirection,
} from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { useTabScreenInsets } from '@/src/navigation/tablet-sidebar-metrics';
import { colors, spacing, typography } from '@/src/theme';

export default function SettingsScreen() {
  const { settings, save } = useSettings();
  const notificationPermission = useNotificationPermissionStatus();
  const { direction, locale, nativeDirection, setLanguagePreference, t } = useTranslation();
  const tabInsets = useTabScreenInsets();
  const notificationsAvailable = notificationPermission.status === 'granted';
  const notificationsBlocked = notificationPermission.status === 'denied';
  const notificationsUnsupported = notificationPermission.status === 'unsupported';
  const canRequestNotifications = notificationPermission.status === 'undetermined';
  const languageToggleLabel =
    locale === 'ar' ? t('settings.switchToEnglish') : t('settings.switchToArabic');
  const tileText = { textAlign: textAlignForTextDirection(direction) };
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };
  const {
    supporterMessageKey,
    supportActionsDisabled,
    priceLabel,
    buy,
    restore,
  } = useSupporterActions();

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
    <Screen contentStyle={[styles.screen, { paddingBottom: tabInsets.paddingBottom }]}>
      <ScreenHeader
        title={t('settings.title')}
        action={
          <IconButton
            icon={IconLanguage}
            label={languageToggleLabel}
            onPress={updateLanguagePreference}
            color={colors.accentDark}
            style={styles.languageButton}
          />
        }
      />

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

      <SettingsSection
        title={t('support.title')}
        badge={
          settings.supporterPurchased ? t('support.badge') : priceLabel
        }>
        <View style={[styles.supportPanel, contentRow]}>
          <View style={styles.permissionCopy}>
            <AppText style={[styles.permissionTitle, styles.tileText, tileText]}>
              {settings.supporterPurchased ? t('support.purchasedTitle') : t('support.freeForever')}
            </AppText>
            <AppText style={[styles.helper, styles.tileText, tileText]}>
              {settings.supporterPurchased ? t('support.purchasedBody') : t('support.body')}
            </AppText>
          </View>
          {!settings.supporterPurchased ? (
            <PrimaryButton
              style={styles.supportButton}
              disabled={supportActionsDisabled}
              onPress={buy}>
              {t('support.purchaseAction')}
            </PrimaryButton>
          ) : null}
        </View>
        {supporterMessageKey ? (
          <AppText selectable style={[styles.supportStatus, styles.tileText, tileText]}>
            {t(supporterMessageKey)}
          </AppText>
        ) : null}
        <Divider />
        <Pressable
          accessibilityLabel={t('support.restore')}
          accessibilityRole="button"
          accessibilityState={{ disabled: supportActionsDisabled }}
          disabled={supportActionsDisabled}
          onPress={restore}
          style={({ pressed }) => [
            styles.restoreButton,
            supportActionsDisabled && styles.restoreButtonDisabled,
            pressed && !supportActionsDisabled && styles.pressed,
          ]}>
          <AppText style={styles.restoreText}>{t('support.restore')}</AppText>
        </Pressable>
        {settings.supporterPurchased ? (
          <>
            <Divider />
            <SwitchRow
              label={t('support.theme')}
              helper={t('support.themeHelper')}
              value={settings.supporterThemeEnabled}
              onValueChange={(supporterThemeEnabled) => {
                triggerFocusHaptic(settings, 'selection');
                save({ supporterThemeEnabled });
              }}
            />
          </>
        ) : null}
      </SettingsSection>

    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  languageButton: {
    flexShrink: 0,
    backgroundColor: colors.surfaceMuted,
  },
  tileText: {
    minWidth: 0,
  },
  helper: {
    color: colors.textMuted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.helper,
  },
  permissionPanel: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  permissionCopy: {
    flex: 1,
    flexBasis: '100%',
    minWidth: 0,
    gap: 3,
  },
  permissionTitle: {
    color: colors.text,
    fontSize: typography.size.control,
    fontWeight: typography.weight.bold,
  },
  permissionButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    minWidth: 86,
    maxWidth: '50%',
    paddingHorizontal: spacing.md,
  },
  systemSettingsButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    minWidth: 0,
    maxWidth: '50%',
    paddingHorizontal: spacing.md,
  },
  supportPanel: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  supportButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    minWidth: 142,
    maxWidth: '50%',
    paddingHorizontal: spacing.md,
  },
  supportStatus: {
    color: colors.textMuted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.helper,
    paddingBottom: spacing.sm,
  },
  restoreButton: {
    minHeight: 44,
    alignItems: 'center',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  restoreButtonDisabled: {
    opacity: 0.5,
  },
  restoreText: {
    color: colors.accentDark,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },
  pressed: {
    opacity: 0.76,
  },
});
