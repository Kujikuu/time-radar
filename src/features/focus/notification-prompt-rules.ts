import type { AppSettings } from './types';
import type { TimerNotificationPermissionStatus } from './notifications';

export type NotificationPermissionPromptPlacement = 'onboarding' | 'home';

type NotificationPermissionPromptInput = {
  settings: Pick<AppSettings, 'onboardingCompleted' | 'notificationPermissionPromptCompleted'>;
  permissionStatus: TimerNotificationPermissionStatus;
  placement: NotificationPermissionPromptPlacement;
};

export function shouldShowNotificationPermissionPrompt({
  settings,
  permissionStatus,
  placement,
}: NotificationPermissionPromptInput) {
  if (permissionStatus !== 'undetermined' || settings.notificationPermissionPromptCompleted) {
    return false;
  }

  if (placement === 'onboarding') {
    return !settings.onboardingCompleted;
  }

  return settings.onboardingCompleted;
}
