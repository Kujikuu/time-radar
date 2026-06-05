import { TablerIcon } from '@/src/components';

export type FocusCategory = 'Work' | 'Study' | 'Personal';

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
