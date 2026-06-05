import { useFocusEffect } from '@react-navigation/native';
import { IconClock, IconFlame, IconTargetArrow } from '@tabler/icons-react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { colors } from '@/src/theme';

import {
  completeTimerPhase,
  createTask,
  defaultSettings,
  formatSeconds,
  getActiveTimerSnapshot,
  getSessionsBetween,
  getSettings,
  getTask,
  getTasks,
  pauseTimer,
  resetTimer,
  resumeTimer,
  startTimer,
  updateSettings,
  updateTask,
} from './repository';
import {
  AppSettings,
  BarPoint,
  DistributionItem,
  FocusCategory,
  FocusSession,
  FocusTask,
  ProgressMetric,
  StatsRange,
  StatsSummary,
  TaskInput,
  TimerSnapshot,
} from './types';

export function useOnboardingStatus() {
  const db = useSQLiteContext();
  const [completed, setCompleted] = useState<boolean | null>(null);

  const reload = useCallback(async () => {
    const settings = await getSettings(db);
    setCompleted(settings.onboardingCompleted);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const complete = useCallback(async () => {
    await updateSettings(db, { onboardingCompleted: true });
    setCompleted(true);
  }, [db]);

  return { completed, complete, reload };
}

export function useTasks() {
  const db = useSQLiteContext();
  const [tasks, setTasks] = useState<FocusTask[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setTasks(await getTasks(db));
    setLoading(false);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return { tasks, loading, reload };
}

export function useTaskDetail(id?: string) {
  const db = useSQLiteContext();
  const [task, setTask] = useState<FocusTask | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!id) {
      setTask(null);
      setLoading(false);
      return;
    }

    setTask(await getTask(db, id));
    setLoading(false);
  }, [db, id]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const save = useCallback(
    async (input: TaskInput) => {
      if (!id) {
        return;
      }

      await updateTask(db, id, input);
      await reload();
    },
    [db, id, reload]
  );

  return { task, loading, save, reload };
}

export function useCreateTask() {
  const db = useSQLiteContext();

  return useCallback(
    async (input: TaskInput) => {
      return createTask(db, input);
    },
    [db]
  );
}

export function useSettings() {
  const db = useSQLiteContext();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setSettings(await getSettings(db));
    setLoading(false);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const save = useCallback(
    async (values: Partial<AppSettings>) => {
      await updateSettings(db, values);
      await reload();
    },
    [db, reload]
  );

  return { settings, loading, save, reload };
}

export function useFocusTimer() {
  const db = useSQLiteContext();
  const [snapshot, setSnapshot] = useState<TimerSnapshot>({
    timer: null,
    task: null,
    remainingSeconds: 0,
    progress: 0,
    display: '25:00',
    phaseLabel: 'Focus',
    primaryActionLabel: 'Start',
  });
  const completingRef = useRef(false);

  const reload = useCallback(async () => {
    setSnapshot(await getActiveTimerSnapshot(db));
  }, [db]);

  const completePhase = useCallback(async () => {
    if (completingRef.current) {
      return;
    }

    completingRef.current = true;
    try {
      await completeTimerPhase(db);
      await reload();
    } finally {
      completingRef.current = false;
    }
  }, [db, reload]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      const nextSnapshot = await getActiveTimerSnapshot(db);
      setSnapshot(nextSnapshot);

      if (
        nextSnapshot.timer?.status === 'running' &&
        nextSnapshot.remainingSeconds <= 0 &&
        !completingRef.current
      ) {
        await completePhase();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [completePhase, db]);

  const start = useCallback(
    async (taskId: string) => {
      await startTimer(db, taskId);
      await reload();
    },
    [db, reload]
  );

  const toggle = useCallback(
    async (fallbackTaskId?: string) => {
      if (!snapshot.timer) {
        if (fallbackTaskId) {
          await startTimer(db, fallbackTaskId);
        }
      } else if (snapshot.timer.status === 'running') {
        await pauseTimer(db);
      } else {
        await resumeTimer(db);
      }

      await reload();
    },
    [db, reload, snapshot.timer]
  );

  const reset = useCallback(async () => {
    await resetTimer(db);
    await reload();
  }, [db, reload]);

  return {
    snapshot,
    start,
    toggle,
    reset,
    completePhase,
    reload,
  };
}

export function useStats(range: StatsRange) {
  const db = useSQLiteContext();
  const [summary, setSummary] = useState<StatsSummary>(() => emptyStats(range));
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const window = rangeWindow(range);
    const previousWindow = previousRangeWindow(range, window.start);
    const [sessions, previousSessions] = await Promise.all([
      getSessionsBetween(db, window.start.toISOString(), window.end.toISOString()),
      getSessionsBetween(db, previousWindow.start.toISOString(), previousWindow.end.toISOString()),
    ]);

    setSummary(buildStats(range, sessions, previousSessions));
    setLoading(false);
  }, [db, range]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return { summary, loading, reload };
}

export function useProgressMetrics(summary: StatsSummary): ProgressMetric[] {
  return useMemo(
    () => [
      {
        id: 'sessions',
        icon: IconClock,
        value: summary.sessions,
        label: 'Sessions',
        tone: 'accent',
      },
      {
        id: 'focus-time',
        icon: IconFlame,
        value: summary.focusTime,
        label: 'Focus Time',
        tone: 'accent',
      },
      {
        id: 'score',
        icon: IconTargetArrow,
        value: summary.focusScore,
        label: 'Focus Score',
        tone: 'green',
      },
    ],
    [summary.focusScore, summary.focusTime, summary.sessions]
  );
}

export function taskInputFromSettings(settings: AppSettings): TaskInput {
  return {
    title: '',
    category: 'Work',
    focusMinutes: settings.defaultFocusMinutes,
    shortBreakMinutes: settings.defaultShortBreakMinutes,
    longBreakMinutes: settings.defaultLongBreakMinutes,
    sessions: settings.defaultSessions,
    sound: settings.defaultSound,
    backgroundSound: settings.defaultBackgroundSound,
    autoStartBreaks: settings.autoStartBreaks,
  };
}

export function taskInputFromTask(task: FocusTask): TaskInput {
  return {
    title: task.title,
    category: task.category,
    focusMinutes: task.focusMinutes,
    shortBreakMinutes: task.shortBreakMinutes,
    longBreakMinutes: task.longBreakMinutes,
    sessions: task.sessions,
    sound: task.sound,
    backgroundSound: task.backgroundSound,
    autoStartBreaks: task.autoStartBreaks,
  };
}

function buildStats(
  range: StatsRange,
  sessions: FocusSession[],
  previousSessions: FocusSession[]
): StatsSummary {
  const focusSessions = sessions.filter((session) => session.phase === 'focus');
  const previousFocusSessions = previousSessions.filter((session) => session.phase === 'focus');
  const focusMinutes = Math.round(
    focusSessions.reduce((sum, session) => sum + session.actualSeconds, 0) / 60
  );
  const previousMinutes = Math.round(
    previousFocusSessions.reduce((sum, session) => sum + session.actualSeconds, 0) / 60
  );
  const trendPercent =
    previousMinutes === 0
      ? focusMinutes > 0
        ? 100
        : 0
      : Math.round(((focusMinutes - previousMinutes) / previousMinutes) * 100);

  return {
    range,
    label: rangeLabel(range),
    focusTime: formatMinutes(focusMinutes),
    focusMinutes,
    sessions: String(focusSessions.length),
    focusScore: `${Math.min(100, focusSessions.length * 25)}%`,
    trendPercent,
    hourlyFocus: buildBars(range, focusSessions),
    distribution: buildDistribution(focusSessions),
  };
}

function buildBars(range: StatsRange, sessions: FocusSession[]): BarPoint[] {
  if (range === 'Day') {
    const buckets = [0, 3, 6, 9, 12, 15, 18, 21, 24];

    return buckets.map((hour) => ({
      label: hour === 0 || hour === 24 ? '12 AM' : hour === 12 ? '12 PM' : `${hour % 12} ${hour < 12 ? 'AM' : 'PM'}`,
      minutes: sumSessions(
        sessions.filter((session) => {
          const sessionHour = new Date(session.startedAt).getHours();
          return hour === 24 ? false : sessionHour >= hour && sessionHour < hour + 3;
        })
      ),
    }));
  }

  const labels =
    range === 'Week'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : range === 'Year'
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        : ['1', '5', '10', '15', '20', '25', '30'];

  return labels.map((label, index) => ({
    label,
    minutes: sumSessions(
      sessions.filter((session) => {
        const date = new Date(session.startedAt);
        if (range === 'Week') {
          return (date.getDay() + 6) % 7 === index;
        }

        if (range === 'Year') {
          return date.getMonth() === index;
        }

        return Math.floor((date.getDate() - 1) / 5) === index;
      })
    ),
  }));
}

function buildDistribution(sessions: FocusSession[]): DistributionItem[] {
  const colorByCategory: Record<FocusCategory, string> = {
    Work: colors.accent,
    Study: colors.greenSoft,
    Personal: colors.blue,
  };

  return (['Work', 'Study', 'Personal'] as FocusCategory[]).map((category) => ({
    label: category,
    minutes: sumSessions(sessions.filter((session) => session.category === category)),
    color: colorByCategory[category],
  }));
}

function sumSessions(sessions: FocusSession[]) {
  return Math.round(sessions.reduce((sum, session) => sum + session.actualSeconds, 0) / 60);
}

function rangeWindow(range: StatsRange) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (range === 'Week') {
    const day = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - day);
  } else if (range === 'Month') {
    start.setDate(1);
  } else if (range === 'Year') {
    start.setMonth(0, 1);
  }

  const end = new Date(start);
  if (range === 'Day') {
    end.setDate(end.getDate() + 1);
  } else if (range === 'Week') {
    end.setDate(end.getDate() + 7);
  } else if (range === 'Month') {
    end.setMonth(end.getMonth() + 1);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }

  return { start, end };
}

function previousRangeWindow(range: StatsRange, currentStart: Date) {
  const end = new Date(currentStart);
  const start = new Date(currentStart);

  if (range === 'Day') {
    start.setDate(start.getDate() - 1);
  } else if (range === 'Week') {
    start.setDate(start.getDate() - 7);
  } else if (range === 'Month') {
    start.setMonth(start.getMonth() - 1);
  } else {
    start.setFullYear(start.getFullYear() - 1);
  }

  return { start, end };
}

function rangeLabel(range: StatsRange) {
  const now = new Date();

  if (range === 'Day') {
    return `Today, ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  return range;
}

function emptyStats(range: StatsRange): StatsSummary {
  return {
    range,
    label: rangeLabel(range),
    focusTime: formatMinutes(0),
    focusMinutes: 0,
    sessions: '0',
    focusScore: '0%',
    trendPercent: 0,
    hourlyFocus: buildBars(range, []),
    distribution: buildDistribution([]),
  };
}

function formatMinutes(minutes: number) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  return `${minutes}m`;
}

export { formatSeconds };
