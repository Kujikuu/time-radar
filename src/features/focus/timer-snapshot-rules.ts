import type { ActiveTimer, TimerPhase } from './types';

export function resolveTimerProgress({
  plannedSeconds,
  remainingSeconds,
}: Pick<ActiveTimer, 'plannedSeconds' | 'remainingSeconds'>) {
  if (!Number.isFinite(plannedSeconds) || plannedSeconds <= 0) {
    return 0;
  }

  const progress = 1 - remainingSeconds / plannedSeconds;
  return Math.min(Math.max(progress, 0), 1);
}

export function resolvePhaseLabel(phase: TimerPhase) {
  if (phase === 'short_break') {
    return 'Short Break';
  }

  if (phase === 'long_break') {
    return 'Long Break';
  }

  return 'Focus';
}

export function resolvePrimaryActionLabel(timer: Pick<ActiveTimer, 'status'> | null) {
  if (!timer) {
    return 'Start';
  }

  return timer.status === 'running' ? 'Pause' : 'Resume';
}
