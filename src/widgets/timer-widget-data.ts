import type { TimerWidgetData, TimerWidgetInput } from './types';

const phaseLabels: Record<string, string> = {
  focus: 'Focus',
  short_break: 'Short Break',
  long_break: 'Long Break',
};

function formatCountdown(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function computeProgress(remainingSeconds: number, plannedSeconds: number): number {
  if (!Number.isFinite(plannedSeconds) || plannedSeconds <= 0) {
    return 0;
  }
  const progress = 1 - remainingSeconds / plannedSeconds;
  const clamped = Math.min(Math.max(progress, 0), 1);
  return Math.round(clamped * 100) / 100;
}

export function formatTimerWidgetData(input: TimerWidgetInput | null): TimerWidgetData | null {
  if (!input) {
    return null;
  }
  return {
    taskTitle: input.taskTitle,
    phase: phaseLabels[input.phase] ?? input.phase,
    status: input.status,
    remainingSeconds: input.remainingSeconds,
    plannedSeconds: input.plannedSeconds,
    displayTime: formatCountdown(input.remainingSeconds),
    progress: computeProgress(input.remainingSeconds, input.plannedSeconds),
    updatedAt: new Date().toISOString(),
  };
}
