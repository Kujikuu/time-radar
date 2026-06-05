import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { AppSettings, FocusTask, TimerPhase } from './types';

const TIMER_CHANNEL_ID = 'timer-completion';
const TIMER_NOTIFICATION_SCOPE = 'time-radar-timer';

export type TimerNotificationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'undetermined'
  | 'unsupported';

type TimerNotificationInput = {
  task: FocusTask;
  phase: TimerPhase;
  dueAt: string | null;
  settings: AppSettings;
};

Notifications.setNotificationHandler({
  handleNotification: async (notification) => ({
    shouldPlaySound: notification.request.content.sound !== null,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function getNotificationPermissionStatus(): Promise<TimerNotificationPermissionStatus> {
  if (Platform.OS === 'web') {
    return 'unsupported';
  }

  await configureTimerNotificationChannel();
  const permissions = await Notifications.getPermissionsAsync();

  if (permissions.granted) {
    return 'granted';
  }

  if (permissions.status === Notifications.PermissionStatus.DENIED) {
    return 'denied';
  }

  return 'undetermined';
}

export async function requestTimerNotificationPermission(): Promise<TimerNotificationPermissionStatus> {
  if (Platform.OS === 'web') {
    return 'unsupported';
  }

  await configureTimerNotificationChannel();
  const existingStatus = await getNotificationPermissionStatus();

  if (existingStatus === 'granted' || existingStatus === 'denied') {
    return existingStatus;
  }

  const permissions = await Notifications.requestPermissionsAsync();
  return permissions.granted ? 'granted' : permissions.status === 'denied' ? 'denied' : 'undetermined';
}

export async function scheduleTimerCompletionNotification({
  task,
  phase,
  dueAt,
  settings,
}: TimerNotificationInput): Promise<string[]> {
  await cancelTimerNotifications();

  if (
    Platform.OS === 'web' ||
    !dueAt ||
    !settings.notificationsEnabled ||
    !isPhaseNotificationEnabled(phase, settings)
  ) {
    return [];
  }

  const permissionStatus = await getNotificationPermissionStatus();

  if (permissionStatus !== 'granted') {
    return [];
  }

  const secondsUntilDue = Math.ceil((new Date(dueAt).getTime() - Date.now()) / 1000);

  if (secondsUntilDue <= 0) {
    return [];
  }

  const scheduledIds: string[] = [];

  if (
    settings.timerWarningEnabled &&
    phase === 'focus' &&
    settings.timerWarningSeconds > 0 &&
    secondsUntilDue > settings.timerWarningSeconds + 5
  ) {
    scheduledIds.push(
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Focus almost done',
          body: `${task.title} has ${formatWarningSeconds(settings.timerWarningSeconds)} left.`,
          data: timerNotificationData(task.id),
          sound: false,
        },
        trigger: timeIntervalTrigger(secondsUntilDue - settings.timerWarningSeconds),
      })
    );
  }

  scheduledIds.push(
    await Notifications.scheduleNotificationAsync({
      content: {
        title: completionTitle(phase),
        body: completionBody(phase, task.title),
        data: timerNotificationData(task.id),
        sound: settings.completionSoundEnabled ? 'default' : false,
      },
      trigger: timeIntervalTrigger(secondsUntilDue),
    })
  );

  return scheduledIds;
}

export async function cancelTimerNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const pendingNotifications = await Notifications.getAllScheduledNotificationsAsync();

  await Promise.all(
    pendingNotifications
      .filter((notification) => notification.content.data?.scope === TIMER_NOTIFICATION_SCOPE)
      .map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier)
      )
  );
}

export function notificationStatusLabel(status: TimerNotificationPermissionStatus) {
  if (status === 'granted') {
    return 'Allowed';
  }

  if (status === 'denied') {
    return 'Blocked';
  }

  if (status === 'unsupported') {
    return 'Not available on web';
  }

  return 'Not enabled';
}

function configureTimerNotificationChannel() {
  if (Platform.OS !== 'android') {
    return Promise.resolve(null);
  }

  return Notifications.setNotificationChannelAsync(TIMER_CHANNEL_ID, {
    name: 'Timer Completion',
    description: 'Focus and break completion alerts.',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 180, 120, 180],
    lightColor: '#F47E61',
  });
}

function isPhaseNotificationEnabled(phase: TimerPhase, settings: AppSettings) {
  if (phase === 'focus') {
    return settings.focusCompleteNotificationsEnabled;
  }

  return settings.breakCompleteNotificationsEnabled;
}

function timeIntervalTrigger(seconds: number): Notifications.TimeIntervalTriggerInput {
  return {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: Math.max(1, Math.round(seconds)),
    channelId: TIMER_CHANNEL_ID,
  };
}

function timerNotificationData(taskId: string) {
  return {
    scope: TIMER_NOTIFICATION_SCOPE,
    url: `/session/${taskId}`,
  };
}

function completionTitle(phase: TimerPhase) {
  if (phase === 'focus') {
    return 'Focus complete';
  }

  if (phase === 'long_break') {
    return 'Long break complete';
  }

  return 'Break complete';
}

function completionBody(phase: TimerPhase, taskTitle: string) {
  if (phase === 'focus') {
    return `${taskTitle} is complete. Time for a break.`;
  }

  return `${taskTitle} is ready for the next focus session.`;
}

function formatWarningSeconds(seconds: number) {
  if (seconds < 60) {
    return `${seconds} seconds`;
  }

  const minutes = Math.round(seconds / 60);
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}
