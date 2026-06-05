import type { FocusTask, TimerPhase, TimerStatus } from './types';

type CompletedTimerInput = {
  task: Pick<
    FocusTask,
    'focusMinutes' | 'shortBreakMinutes' | 'longBreakMinutes' | 'sessions' | 'autoStartBreaks'
  >;
  currentPhase: TimerPhase;
  completedFocusCount: number;
};

type CompletedTimerTransition = {
  completedFocusCount: number;
  nextPhase: TimerPhase;
  nextStatus: TimerStatus;
  nextSeconds: number;
};

type TimerActualSecondsInput = {
  status: TimerStatus;
  plannedSeconds: number;
  remainingSeconds: number;
  dueAt: string | null;
  nowMs?: number;
};

export function resolveCompletedTimerTransition({
  task,
  currentPhase,
  completedFocusCount,
}: CompletedTimerInput): CompletedTimerTransition {
  const nextCompletedFocusCount =
    currentPhase === 'focus' ? completedFocusCount + 1 : completedFocusCount;
  const nextPhase = resolveNextTimerPhase(currentPhase, nextCompletedFocusCount, task.sessions);

  return {
    completedFocusCount: nextCompletedFocusCount,
    nextPhase,
    nextStatus: currentPhase === 'focus' && task.autoStartBreaks ? 'running' : 'paused',
    nextSeconds: resolvePhaseSeconds(task, nextPhase),
  };
}

function resolveNextTimerPhase(
  currentPhase: TimerPhase,
  completedFocusCount: number,
  sessionsBeforeLongBreak: number
): TimerPhase {
  if (currentPhase !== 'focus') {
    return 'focus';
  }

  const safeThreshold = Math.max(1, Math.round(sessionsBeforeLongBreak));
  return completedFocusCount % safeThreshold === 0 ? 'long_break' : 'short_break';
}

export function resolvePhaseSeconds(
  task: Pick<FocusTask, 'focusMinutes' | 'shortBreakMinutes' | 'longBreakMinutes'>,
  phase: TimerPhase
) {
  if (phase === 'short_break') {
    return task.shortBreakMinutes * 60;
  }

  if (phase === 'long_break') {
    return task.longBreakMinutes * 60;
  }

  return task.focusMinutes * 60;
}

export function resolveTimerActualSeconds({
  status,
  plannedSeconds,
  remainingSeconds,
  dueAt,
  nowMs = Date.now(),
}: TimerActualSecondsInput) {
  const resolvedRemainingSeconds =
    status === 'running' && dueAt
      ? Math.ceil((new Date(dueAt).getTime() - nowMs) / 1000)
      : remainingSeconds;
  const actualSeconds = plannedSeconds - resolvedRemainingSeconds;

  if (!Number.isFinite(actualSeconds)) {
    return 0;
  }

  return Math.min(Math.max(Math.round(actualSeconds), 0), plannedSeconds);
}
