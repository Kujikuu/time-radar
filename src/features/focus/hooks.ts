import { useFocusEffect } from "expo-router/react-navigation";
import { IconClock, IconFlame, IconTargetArrow } from '@tabler/icons-react-native';
import { type SQLiteDatabase, useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import type { AppLocale } from '@/src/i18n';
import { formatDuration, translate } from '@/src/i18n';
import { colors } from '@/src/theme';

import { syncTimerToWidget } from '@/src/widgets/widget-sync';

import { triggerFocusHaptic } from './haptics';
import {
  cancelTimerNotifications,
  getNotificationPermissionStatus,
  presentTimerCompletionNotification,
  requestTimerNotificationPermission,
  scheduleTimerCompletionNotification,
  TimerNotificationPermissionStatus,
} from './notifications';
import {
  archiveTask,
  completeTimerPhase,
  createTask,
  defaultSettings,
  getActiveTimerSnapshot,
  getSessionsBetween,
  getSettings,
  getTask,
  getTasks,
  pauseTimer,
  removeActiveTask,
  resetTimer,
  resumeTimer,
  restoreTask,
  startTimer,
  taskHasActiveTimer,
  updateSettings,
  updateTask,
} from './repository';
import {
  buildStatsSummary,
  emptyStats,
  type FocusCategoryColors,
  previousRangeWindow,
  rangeWindow,
} from './stats-rules';
import {
  AppSettings,
  FocusTask,
  ProgressMetric,
  StatsRange,
  StatsSummary,
  TaskInput,
  TimerSnapshot,
} from './types';

const focusCategoryColors: FocusCategoryColors = {
  Work: colors.accent,
  Study: colors.greenSoft,
  Personal: colors.blue,
};

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

export function useTaskRemoval() {
  const db = useSQLiteContext();

  const archive = useCallback(
    async (taskId: string) => {
      await archiveTask(db, taskId);
      triggerFocusHaptic(await getSettings(db), 'selection');
    },
    [db]
  );

  const remove = useCallback(
    async (taskId: string) => {
      const result = await removeActiveTask(db, taskId);

      if (result.activeTimerReset) {
        await cancelTimerNotifications();
      }

      triggerFocusHaptic(await getSettings(db), result.activeTimerReset ? 'reset' : 'selection');

      return result;
    },
    [db]
  );

  const restore = useCallback(
    async (taskId: string) => {
      await restoreTask(db, taskId);
      triggerFocusHaptic(await getSettings(db), 'selection');
    },
    [db]
  );

  const isTaskActive = useCallback(
    async (taskId: string) => taskHasActiveTimer(db, taskId),
    [db]
  );

  return { archive, remove, restore, isTaskActive };
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
      await syncActiveTimerNotification(db);
    },
    [db, reload]
  );

  return { settings, loading, save, reload };
}

export function useNotificationPermissionStatus() {
  const [status, setStatus] = useState<TimerNotificationPermissionStatus>('undetermined');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setStatus(await getNotificationPermissionStatus());
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const request = useCallback(async () => {
    const nextStatus = await requestTimerNotificationPermission();
    setStatus(nextStatus);
    return nextStatus;
  }, []);

  return { status, loading, reload, request };
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

  const completePhase = useCallback(async (notifyForegroundCompletion = false) => {
    if (completingRef.current) {
      return;
    }

    completingRef.current = true;
    try {
      const completionSnapshot = await getActiveTimerSnapshot(db);
      const settings = await getSettings(db);

      await completeTimerPhase(db);
      triggerFocusHaptic(settings, 'complete');

      if (completionSnapshot.timer && completionSnapshot.task) {
        await presentTimerCompletionNotification({
          task: completionSnapshot.task,
          phase: completionSnapshot.timer.phase,
          settings,
          automaticForegroundCompletion: notifyForegroundCompletion,
        });
      }

      await syncActiveTimerNotification(db);
      await reload();
    } finally {
      completingRef.current = false;
    }
  }, [db, reload]);

  useFocusEffect(
    useCallback(() => {
      reload();
      void syncActiveTimerNotification(db);
    }, [db, reload])
  );

  useEffect(() => {
    const syncTimerState = async (notifyForegroundCompletion = false) => {
      const nextSnapshot = await getActiveTimerSnapshot(db);
      setSnapshot(nextSnapshot);

      if (
        nextSnapshot.timer?.status === 'running' &&
        nextSnapshot.remainingSeconds <= 0 &&
        !completingRef.current
      ) {
        await completePhase(notifyForegroundCompletion);
      }
    };

    const interval = setInterval(() => {
      void syncTimerState(AppState.currentState === 'active');
    }, 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void syncTimerState(false);
        void syncActiveTimerNotification(db);
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [completePhase, db]);

  useEffect(() => {
    if (snapshot.timer) {
      void syncTimerToWidget({
        taskTitle: snapshot.task?.title ?? 'Focus',
        phase: snapshot.timer.phase,
        status: snapshot.timer.status,
        remainingSeconds: snapshot.remainingSeconds,
        plannedSeconds: snapshot.timer.plannedSeconds,
      });
    } else {
      void syncTimerToWidget(null);
    }
  }, [snapshot]);

  const start = useCallback(
    async (taskId: string) => {
      await startTimer(db, taskId);
      triggerFocusHaptic(await getSettings(db), 'start');
      await syncActiveTimerNotification(db);
      await reload();
    },
    [db, reload]
  );

  const toggle = useCallback(
    async (fallbackTaskId?: string) => {
      if (!snapshot.timer) {
        if (fallbackTaskId) {
          await startTimer(db, fallbackTaskId);
          triggerFocusHaptic(await getSettings(db), 'start');
          await syncActiveTimerNotification(db);
        }
      } else if (snapshot.timer.status === 'running') {
        await pauseTimer(db);
        triggerFocusHaptic(await getSettings(db), 'pause');
        await cancelTimerNotifications();
      } else {
        await resumeTimer(db);
        triggerFocusHaptic(await getSettings(db), 'start');
        await syncActiveTimerNotification(db);
      }

      await reload();
    },
    [db, reload, snapshot.timer]
  );

  const reset = useCallback(async () => {
    await resetTimer(db);
    triggerFocusHaptic(await getSettings(db), 'reset');
    await cancelTimerNotifications();
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

async function syncActiveTimerNotification(db: SQLiteDatabase) {
  try {
    const [settings, snapshot] = await Promise.all([getSettings(db), getActiveTimerSnapshot(db)]);

    if (snapshot.timer?.status === 'running' && snapshot.task) {
      await scheduleTimerCompletionNotification({
        task: snapshot.task,
        phase: snapshot.timer.phase,
        dueAt: snapshot.timer.dueAt,
        settings,
      });
      return;
    }

    await cancelTimerNotifications();
  } catch {
    await cancelTimerNotifications();
  }
}

export function useStats(range: StatsRange, locale: AppLocale = 'en') {
  const db = useSQLiteContext();
  const [summary, setSummary] = useState<StatsSummary>(() =>
    emptyStats(range, focusCategoryColors, new Date(), locale)
  );
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const window = rangeWindow(range);
    const previousWindow = previousRangeWindow(range, window.start);
    const [sessions, previousSessions] = await Promise.all([
      getSessionsBetween(db, window.start.toISOString(), window.end.toISOString()),
      getSessionsBetween(db, previousWindow.start.toISOString(), previousWindow.end.toISOString()),
    ]);

    setSummary(
      buildStatsSummary({
        range,
        sessions,
        previousSessions,
        categoryColors: focusCategoryColors,
        locale,
      })
    );
    setLoading(false);
  }, [db, locale, range]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return { summary, loading, reload };
}

export function useProgressMetrics(
  summary: StatsSummary,
  locale: AppLocale = 'en'
): ProgressMetric[] {
  return useMemo(
    () => [
      {
        id: 'sessions',
        icon: IconClock,
        value: summary.sessions,
        label: translate(locale, 'metrics.sessions'),
        tone: 'accent',
      },
      {
        id: 'focus-time',
        icon: IconFlame,
        value: formatDuration(locale, summary.focusMinutes),
        label: translate(locale, 'metrics.focusTime'),
        tone: 'accent',
      },
      {
        id: 'score',
        icon: IconTargetArrow,
        value: summary.focusScore,
        label: translate(locale, 'metrics.focusScore'),
        tone: 'green',
      },
    ],
    [locale, summary.focusMinutes, summary.focusScore, summary.sessions]
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
