export type WidgetPhase = 'focus' | 'short_break' | 'long_break';
export type WidgetStatus = 'running' | 'paused';

export type TimerWidgetInput = {
  taskTitle: string;
  phase: WidgetPhase;
  status: WidgetStatus;
  remainingSeconds: number;
  plannedSeconds: number;
};

export type TimerWidgetData = {
  taskTitle: string;
  phase: string;
  status: WidgetStatus;
  remainingSeconds: number;
  plannedSeconds: number;
  displayTime: string;
  progress: number;
  updatedAt: string;
};
