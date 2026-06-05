import type { AppSettings, TimerPhase } from './types';

type TimerNotificationPlanInput = {
  phase: TimerPhase;
  dueAt: string | null;
  settings: AppSettings;
  nowMs?: number;
};

type TimerNotificationPlan = {
  completionDelaySeconds: number | null;
  warningDelaySeconds: number | null;
};

export function resolveTimerNotificationPlan({
  phase,
  dueAt,
  settings,
  nowMs = Date.now(),
}: TimerNotificationPlanInput): TimerNotificationPlan {
  if (!dueAt || !settings.notificationsEnabled || !isPhaseNotificationEnabled(phase, settings)) {
    return emptyNotificationPlan();
  }

  const completionDelaySeconds = Math.ceil((new Date(dueAt).getTime() - nowMs) / 1000);

  if (!Number.isFinite(completionDelaySeconds) || completionDelaySeconds <= 0) {
    return emptyNotificationPlan();
  }

  return {
    completionDelaySeconds,
    warningDelaySeconds: resolveWarningDelaySeconds({
      phase,
      completionDelaySeconds,
      settings,
    }),
  };
}

export function isPhaseNotificationEnabled(phase: TimerPhase, settings: AppSettings) {
  if (phase === 'focus') {
    return settings.focusCompleteNotificationsEnabled;
  }

  return settings.breakCompleteNotificationsEnabled;
}

function resolveWarningDelaySeconds({
  phase,
  completionDelaySeconds,
  settings,
}: {
  phase: TimerPhase;
  completionDelaySeconds: number;
  settings: AppSettings;
}) {
  if (
    !settings.timerWarningEnabled ||
    phase !== 'focus' ||
    settings.timerWarningSeconds <= 0 ||
    completionDelaySeconds <= settings.timerWarningSeconds + 5
  ) {
    return null;
  }

  return completionDelaySeconds - settings.timerWarningSeconds;
}

function emptyNotificationPlan(): TimerNotificationPlan {
  return {
    completionDelaySeconds: null,
    warningDelaySeconds: null,
  };
}
