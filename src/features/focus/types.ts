import type { TablerIcon } from '@/src/components';

export type FocusCategory = 'Work' | 'Study' | 'Personal';
export type TimerPhase = 'focus' | 'short_break' | 'long_break';
export type TimerStatus = 'running' | 'paused';
export type SessionStatus = 'completed' | 'reset';
export type StatsRange = 'Day' | 'Week' | 'Month' | 'Year';
export type AppLanguagePreference = 'system' | 'en' | 'ar';

export type FocusTask = {
  id: string;
  title: string;
  category: FocusCategory;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessions: number;
  sound: string;
  backgroundSound: string;
  autoStartBreaks: boolean;
  sortOrder: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskInput = {
  title: string;
  category: FocusCategory;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessions: number;
  sound: string;
  backgroundSound: string;
  autoStartBreaks: boolean;
};

export type AppSettings = {
  onboardingCompleted: boolean;
  notificationPermissionPromptCompleted: boolean;
  languagePreference: AppLanguagePreference;
  defaultFocusMinutes: number;
  defaultShortBreakMinutes: number;
  defaultLongBreakMinutes: number;
  defaultSessions: number;
  defaultSound: string;
  defaultBackgroundSound: string;
  autoStartBreaks: boolean;
  notificationsEnabled: boolean;
  focusCompleteNotificationsEnabled: boolean;
  breakCompleteNotificationsEnabled: boolean;
  completionSoundEnabled: boolean;
  timerWarningEnabled: boolean;
  timerWarningSeconds: number;
  hapticsEnabled: boolean;
  supporterPurchased: boolean;
  supporterThemeEnabled: boolean;
};

export type ActiveTimer = {
  taskId: string;
  phase: TimerPhase;
  status: TimerStatus;
  startedAt: string;
  dueAt: string | null;
  plannedSeconds: number;
  remainingSeconds: number;
  completedFocusCount: number;
  updatedAt: string;
};

export type FocusSession = {
  id: string;
  taskId: string | null;
  taskTitle: string;
  category: FocusCategory;
  phase: TimerPhase;
  startedAt: string;
  endedAt: string;
  plannedSeconds: number;
  actualSeconds: number;
  status: SessionStatus;
};

export type TimerSnapshot = {
  timer: ActiveTimer | null;
  task: FocusTask | null;
  remainingSeconds: number;
  progress: number;
  display: string;
  phaseLabel: string;
  primaryActionLabel: string;
};

export type StatsSummary = {
  range: StatsRange;
  label: string;
  focusTime: string;
  focusMinutes: number;
  sessions: string;
  focusScore: string;
  trendPercent: number;
  hourlyFocus: BarPoint[];
  distribution: DistributionItem[];
};

export type ProgressMetric = {
  id: string;
  icon: TablerIcon;
  value: string;
  label: string;
  tone: 'accent' | 'green' | 'amber';
};

export type BarPoint = {
  label: string;
  minutes: number;
};

export type DistributionItem = {
  label: FocusCategory;
  minutes: number;
  color: string;
};
