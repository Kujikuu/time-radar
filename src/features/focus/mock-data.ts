import { IconClock, IconFlame, IconTargetArrow } from '@tabler/icons-react-native';

import { colors } from '@/src/theme';

import { BarPoint, DistributionItem, FocusTask, ProgressMetric } from './types';

export const today = {
  label: 'Today',
  date: 'May 20, Tue',
  focusTime: '2h 15m',
  focusScore: '85%',
  sessions: '3',
  timerLabel: 'Focus',
  timerDisplay: '25:00',
};

export const progressMetrics: ProgressMetric[] = [
  {
    id: 'sessions',
    icon: IconClock,
    value: today.sessions,
    label: 'Sessions',
    tone: 'accent',
  },
  {
    id: 'focus-time',
    icon: IconFlame,
    value: today.focusTime,
    label: 'Focus Time',
    tone: 'accent',
  },
  {
    id: 'score',
    icon: IconTargetArrow,
    value: today.focusScore,
    label: 'Focus Score',
    tone: 'green',
  },
];

export const focusTasks: FocusTask[] = [
  {
    id: 'project-proposal',
    title: 'Project Proposal',
    category: 'Work',
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessions: 4,
    sound: 'Soft Bell',
    backgroundSound: 'None',
    autoStartBreaks: true,
  },
  {
    id: 'market-research',
    title: 'Market Research',
    category: 'Study',
    focusMinutes: 30,
    shortBreakMinutes: 5,
    longBreakMinutes: 20,
    sessions: 3,
    sound: 'Glass Chime',
    backgroundSound: 'Low Rain',
    autoStartBreaks: false,
  },
  {
    id: 'weekly-review',
    title: 'Weekly Review',
    category: 'Personal',
    focusMinutes: 20,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessions: 2,
    sound: 'Soft Bell',
    backgroundSound: 'None',
    autoStartBreaks: true,
  },
];

export const hourlyFocus: BarPoint[] = [
  { label: '12 AM', minutes: 0 },
  { label: '3 AM', minutes: 6 },
  { label: '6 AM', minutes: 9 },
  { label: '9 AM', minutes: 31 },
  { label: '12 PM', minutes: 60 },
  { label: '3 PM', minutes: 36 },
  { label: '6 PM', minutes: 9 },
  { label: '9 PM', minutes: 21 },
  { label: '12 AM', minutes: 0 },
];

export const distribution: DistributionItem[] = [
  { label: 'Work', minutes: 80, color: colors.accent },
  { label: 'Study', minutes: 40, color: colors.greenSoft },
  { label: 'Personal', minutes: 15, color: colors.blue },
];
