import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { AppSettings, FocusTask, TimerPhase } from './types';
import {
  isPhaseNotificationEnabled,
  resolveImmediateCompletionNotificationPlan,
  resolveTimerNotificationPlan,
} from './notification-rules';

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

type ImmediateTimerCompletionNotificationInput = {
  task: FocusTask;
  phase: TimerPhase;
  settings: AppSettings;
  automaticForegroundCompletion: boolean;
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

  try {
    await configureTimerNotificationChannel();
    return mapPermissionStatus(await Notifications.getPermissionsAsync());
  } catch {
    return 'unsupported';
  }
}

export async function requestTimerNotificationPermission(): Promise<TimerNotificationPermissionStatus> {
  if (Platform.OS === 'web') {
    return 'unsupported';
  }

  let existingStatus: TimerNotificationPermissionStatus;

  try {
    await configureTimerNotificationChannel();
    existingStatus = await getNotificationPermissionStatus();
  } catch {
    return 'unsupported';
  }

  if (existingStatus === 'granted' || existingStatus === 'denied') {
    return existingStatus;
  }

  try {
    return mapPermissionStatus(await Notifications.requestPermissionsAsync());
  } catch {
    return 'unsupported';
  }
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

  const plan = resolveTimerNotificationPlan({
    phase,
    dueAt,
    settings,
  });

  if (!plan.completionDelaySeconds) {
    return [];
  }

  const scheduledIds: string[] = [];

  if (plan.warningDelaySeconds) {
    scheduledIds.push(
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Focus almost done',
          body: `${task.title} has ${formatWarningSeconds(settings.timerWarningSeconds)} left.`,
          data: timerNotificationData(task.id),
          sound: false,
        },
        trigger: timeIntervalTrigger(plan.warningDelaySeconds),
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
      trigger: timeIntervalTrigger(plan.completionDelaySeconds),
    })
  );

  return scheduledIds;
}

export async function presentTimerCompletionNotification({
  task,
  phase,
  settings,
  automaticForegroundCompletion,
}: ImmediateTimerCompletionNotificationInput): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  const plan = resolveImmediateCompletionNotificationPlan({
    phase,
    settings,
    automaticForegroundCompletion,
  });

  if (!plan.shouldPresent) {
    return null;
  }

  const permissionStatus = await getNotificationPermissionStatus();

  if (permissionStatus !== 'granted') {
    return null;
  }

  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: completionTitle(phase),
        body: completionBody(phase, task.title),
        data: timerNotificationData(task.id),
        sound: plan.shouldPlaySound ? 'default' : false,
      },
      trigger: null,
    });
  } catch {
    return null;
  }
}

export async function cancelTimerNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  let pendingNotifications: Awaited<ReturnType<typeof Notifications.getAllScheduledNotificationsAsync>>;

  try {
    pendingNotifications = await Notifications.getAllScheduledNotificationsAsync();
  } catch {
    return;
  }

  await Promise.all(
    pendingNotifications
      .filter((notification) => notification.content.data?.scope === TIMER_NOTIFICATION_SCOPE)
      .map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier).catch(() => undefined)
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

function timeIntervalTrigger(seconds: number): Notifications.TimeIntervalTriggerInput {
  return {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: Math.max(1, Math.round(seconds)),
    channelId: TIMER_CHANNEL_ID,
  };
}

function mapPermissionStatus(
  permissions: Notifications.NotificationPermissionsStatus
): TimerNotificationPermissionStatus {
  if (permissions.granted) {
    return 'granted';
  }

  if (Platform.OS === 'ios' && permissions.ios?.status !== undefined) {
    if (
      permissions.ios.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
      permissions.ios.status === Notifications.IosAuthorizationStatus.PROVISIONAL ||
      permissions.ios.status === Notifications.IosAuthorizationStatus.EPHEMERAL
    ) {
      return 'granted';
    }

    if (permissions.ios.status === Notifications.IosAuthorizationStatus.DENIED) {
      return 'denied';
    }

    return 'undetermined';
  }

  if (permissions.status === Notifications.PermissionStatus.DENIED) {
    return 'denied';
  }

  return 'undetermined';
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
