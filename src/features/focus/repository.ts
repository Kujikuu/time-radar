import { type SQLiteDatabase } from 'expo-sqlite';

import {
  ActiveTimer,
  AppSettings,
  FocusCategory,
  FocusSession,
  FocusTask,
  TaskInput,
  TimerPhase,
  TimerSnapshot,
  TimerStatus,
} from './types';
import {
  resolveCompletedTimerTransition,
  resolvePhaseSeconds,
  resolveTimerActualSeconds,
} from './timer-rules';
import {
  resolvePhaseLabel,
  resolvePrimaryActionLabel,
  resolveTimerProgress,
} from './timer-snapshot-rules';

type TaskRow = {
  id: string;
  title: string;
  category: FocusCategory;
  focus_minutes: number;
  short_break_minutes: number;
  long_break_minutes: number;
  sessions_before_long_break: number;
  sound: string;
  background_sound: string;
  auto_start_breaks: number;
  sort_order: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

type SettingsRow = {
  key: string;
  value: string;
};

type TimerRow = {
  task_id: string;
  phase_type: TimerPhase;
  status: TimerStatus;
  started_at: string;
  due_at: string | null;
  planned_seconds: number;
  remaining_seconds: number;
  completed_focus_count: number;
  updated_at: string;
};

type SessionRow = {
  id: string;
  task_id: string | null;
  task_title: string;
  category: FocusCategory;
  phase_type: TimerPhase;
  started_at: string;
  ended_at: string;
  planned_seconds: number;
  actual_seconds: number;
  status: 'completed' | 'reset';
};

export const defaultSettings: AppSettings = {
  onboardingCompleted: false,
  defaultFocusMinutes: 25,
  defaultShortBreakMinutes: 5,
  defaultLongBreakMinutes: 15,
  defaultSessions: 4,
  defaultSound: 'Soft Bell',
  defaultBackgroundSound: 'None',
  autoStartBreaks: true,
  notificationsEnabled: false,
  focusCompleteNotificationsEnabled: true,
  breakCompleteNotificationsEnabled: true,
  completionSoundEnabled: true,
  timerWarningEnabled: false,
  timerWarningSeconds: 60,
  hapticsEnabled: true,
};

export async function getTasks(db: SQLiteDatabase): Promise<FocusTask[]> {
  const rows = await db.getAllAsync<TaskRow>(
    `SELECT * FROM tasks
     WHERE archived_at IS NULL
     ORDER BY sort_order ASC, created_at ASC`
  );

  return rows.map(mapTask);
}

export async function getTask(db: SQLiteDatabase, id: string): Promise<FocusTask | null> {
  const row = await db.getFirstAsync<TaskRow>('SELECT * FROM tasks WHERE id = ?', id);
  return row ? mapTask(row) : null;
}

export async function createTask(db: SQLiteDatabase, input: TaskInput): Promise<string> {
  const id = createId('task');
  const now = new Date().toISOString();
  const order = await nextTaskOrder(db);

  await db.runAsync(
    `INSERT INTO tasks (
      id,
      title,
      category,
      focus_minutes,
      short_break_minutes,
      long_break_minutes,
      sessions_before_long_break,
      sound,
      background_sound,
      auto_start_breaks,
      sort_order,
      archived_at,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
    [
      id,
      normalizeTitle(input.title),
      input.category,
      clampMinutes(input.focusMinutes, 1, 180),
      clampMinutes(input.shortBreakMinutes, 1, 60),
      clampMinutes(input.longBreakMinutes, 1, 120),
      clampMinutes(input.sessions, 1, 12),
      input.sound,
      input.backgroundSound,
      input.autoStartBreaks ? 1 : 0,
      order,
      now,
      now,
    ]
  );

  return id;
}

export async function updateTask(db: SQLiteDatabase, id: string, input: TaskInput): Promise<void> {
  await db.runAsync(
    `UPDATE tasks
     SET title = ?,
         category = ?,
         focus_minutes = ?,
         short_break_minutes = ?,
         long_break_minutes = ?,
         sessions_before_long_break = ?,
         sound = ?,
         background_sound = ?,
         auto_start_breaks = ?,
         updated_at = ?
     WHERE id = ?`,
    [
      normalizeTitle(input.title),
      input.category,
      clampMinutes(input.focusMinutes, 1, 180),
      clampMinutes(input.shortBreakMinutes, 1, 60),
      clampMinutes(input.longBreakMinutes, 1, 120),
      clampMinutes(input.sessions, 1, 12),
      input.sound,
      input.backgroundSound,
      input.autoStartBreaks ? 1 : 0,
      new Date().toISOString(),
      id,
    ]
  );
}

export async function getSettings(db: SQLiteDatabase): Promise<AppSettings> {
  const rows = await db.getAllAsync<SettingsRow>('SELECT key, value FROM app_settings');
  const settings = new Map(rows.map((row) => [row.key, row.value]));

  return {
    onboardingCompleted: settings.get('onboarding_completed') === 'true',
    defaultFocusMinutes: readNumberSetting(settings, 'default_focus_minutes', 25),
    defaultShortBreakMinutes: readNumberSetting(settings, 'default_short_break_minutes', 5),
    defaultLongBreakMinutes: readNumberSetting(settings, 'default_long_break_minutes', 15),
    defaultSessions: readNumberSetting(settings, 'default_sessions', 4),
    defaultSound: settings.get('default_sound') ?? defaultSettings.defaultSound,
    defaultBackgroundSound:
      settings.get('default_background_sound') ?? defaultSettings.defaultBackgroundSound,
    autoStartBreaks: settings.get('auto_start_breaks') !== 'false',
    notificationsEnabled: settings.get('notifications_enabled') === 'true',
    focusCompleteNotificationsEnabled:
      settings.get('focus_complete_notifications_enabled') !== 'false',
    breakCompleteNotificationsEnabled:
      settings.get('break_complete_notifications_enabled') !== 'false',
    completionSoundEnabled: settings.get('completion_sound_enabled') !== 'false',
    timerWarningEnabled: settings.get('timer_warning_enabled') === 'true',
    timerWarningSeconds: readNumberSetting(
      settings,
      'timer_warning_seconds',
      defaultSettings.timerWarningSeconds
    ),
    hapticsEnabled: settings.get('haptics_enabled') !== 'false',
  };
}

export async function updateSettings(
  db: SQLiteDatabase,
  values: Partial<AppSettings>
): Promise<void> {
  const now = new Date().toISOString();
  const entries: [string, string][] = [];

  if (values.onboardingCompleted !== undefined) {
    entries.push(['onboarding_completed', String(values.onboardingCompleted)]);
  }
  if (values.defaultFocusMinutes !== undefined) {
    entries.push(['default_focus_minutes', String(clampMinutes(values.defaultFocusMinutes, 1, 180))]);
  }
  if (values.defaultShortBreakMinutes !== undefined) {
    entries.push([
      'default_short_break_minutes',
      String(clampMinutes(values.defaultShortBreakMinutes, 1, 60)),
    ]);
  }
  if (values.defaultLongBreakMinutes !== undefined) {
    entries.push([
      'default_long_break_minutes',
      String(clampMinutes(values.defaultLongBreakMinutes, 1, 120)),
    ]);
  }
  if (values.defaultSessions !== undefined) {
    entries.push(['default_sessions', String(clampMinutes(values.defaultSessions, 1, 12))]);
  }
  if (values.defaultSound !== undefined) {
    entries.push(['default_sound', values.defaultSound]);
  }
  if (values.defaultBackgroundSound !== undefined) {
    entries.push(['default_background_sound', values.defaultBackgroundSound]);
  }
  if (values.autoStartBreaks !== undefined) {
    entries.push(['auto_start_breaks', String(values.autoStartBreaks)]);
  }
  if (values.notificationsEnabled !== undefined) {
    entries.push(['notifications_enabled', String(values.notificationsEnabled)]);
  }
  if (values.focusCompleteNotificationsEnabled !== undefined) {
    entries.push([
      'focus_complete_notifications_enabled',
      String(values.focusCompleteNotificationsEnabled),
    ]);
  }
  if (values.breakCompleteNotificationsEnabled !== undefined) {
    entries.push([
      'break_complete_notifications_enabled',
      String(values.breakCompleteNotificationsEnabled),
    ]);
  }
  if (values.completionSoundEnabled !== undefined) {
    entries.push(['completion_sound_enabled', String(values.completionSoundEnabled)]);
  }
  if (values.timerWarningEnabled !== undefined) {
    entries.push(['timer_warning_enabled', String(values.timerWarningEnabled)]);
  }
  if (values.timerWarningSeconds !== undefined) {
    entries.push([
      'timer_warning_seconds',
      String(clampMinutes(values.timerWarningSeconds, 10, 600)),
    ]);
  }
  if (values.hapticsEnabled !== undefined) {
    entries.push(['haptics_enabled', String(values.hapticsEnabled)]);
  }

  for (const [key, value] of entries) {
    await db.runAsync(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [key, value, now]
    );
  }
}

export async function getActiveTimerSnapshot(db: SQLiteDatabase): Promise<TimerSnapshot> {
  const timer = await getActiveTimer(db);
  const task = timer ? await getTask(db, timer.taskId) : null;
  const remainingSeconds = timer ? resolveRemainingSeconds(timer) : 0;

  return {
    timer,
    task,
    remainingSeconds,
    progress: timer
      ? resolveTimerProgress({ plannedSeconds: timer.plannedSeconds, remainingSeconds })
      : 0,
    display: formatSeconds(remainingSeconds),
    phaseLabel: timer ? resolvePhaseLabel(timer.phase) : 'Focus',
    primaryActionLabel: resolvePrimaryActionLabel(timer),
  };
}

export async function startTimer(db: SQLiteDatabase, taskId: string): Promise<void> {
  const task = await getTask(db, taskId);

  if (!task) {
    return;
  }

  const plannedSeconds = resolvePhaseSeconds(task, 'focus');

  await recordActiveTimerReset(db);

  await upsertTimer(db, {
    task,
    phase: 'focus',
    status: 'running',
    plannedSeconds,
    remainingSeconds: plannedSeconds,
    completedFocusCount: 0,
  });
}

export async function pauseTimer(db: SQLiteDatabase): Promise<void> {
  const timer = await getActiveTimer(db);

  if (!timer || timer.status !== 'running') {
    return;
  }

  await db.runAsync(
    `UPDATE active_timer
     SET status = 'paused',
         due_at = NULL,
         remaining_seconds = ?,
         updated_at = ?
     WHERE id = 1`,
    [resolveRemainingSeconds(timer), new Date().toISOString()]
  );
}

export async function resumeTimer(db: SQLiteDatabase): Promise<void> {
  const timer = await getActiveTimer(db);

  if (!timer || timer.status !== 'paused') {
    return;
  }

  const now = Date.now();
  const remainingSeconds = Math.max(timer.remainingSeconds, 1);

  await db.runAsync(
    `UPDATE active_timer
     SET status = 'running',
         due_at = ?,
         updated_at = ?
     WHERE id = 1`,
    [new Date(now + remainingSeconds * 1000).toISOString(), new Date(now).toISOString()]
  );
}

export async function resetTimer(db: SQLiteDatabase): Promise<void> {
  await recordActiveTimerReset(db);
  await db.runAsync('DELETE FROM active_timer WHERE id = 1');
}

export async function completeTimerPhase(db: SQLiteDatabase): Promise<void> {
  const timer = await getActiveTimer(db);

  if (!timer) {
    return;
  }

  const task = await getTask(db, timer.taskId);

  if (!task) {
    await resetTimer(db);
    return;
  }

  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO focus_sessions (
      id,
      task_id,
      task_title,
      category,
      phase_type,
      started_at,
      ended_at,
      planned_seconds,
      actual_seconds,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
    [
      createId('session'),
      task.id,
      task.title,
      task.category,
      timer.phase,
      timer.startedAt,
      now,
      timer.plannedSeconds,
      timer.plannedSeconds,
    ]
  );

  const transition = resolveCompletedTimerTransition({
    task,
    currentPhase: timer.phase,
    completedFocusCount: timer.completedFocusCount,
  });

  await upsertTimer(db, {
    task,
    phase: transition.nextPhase,
    status: transition.nextStatus,
    plannedSeconds: transition.nextSeconds,
    remainingSeconds: transition.nextSeconds,
    completedFocusCount: transition.completedFocusCount,
  });
}

async function recordActiveTimerReset(db: SQLiteDatabase): Promise<void> {
  const timer = await getActiveTimer(db);

  if (!timer) {
    return;
  }

  const task = await getTask(db, timer.taskId);

  if (!task) {
    await db.runAsync('DELETE FROM active_timer WHERE id = 1');
    return;
  }

  const endedAt = new Date().toISOString();
  const actualSeconds = resolveTimerActualSeconds({
    status: timer.status,
    plannedSeconds: timer.plannedSeconds,
    remainingSeconds: timer.remainingSeconds,
    dueAt: timer.dueAt,
  });

  await db.runAsync(
    `INSERT INTO focus_sessions (
      id,
      task_id,
      task_title,
      category,
      phase_type,
      started_at,
      ended_at,
      planned_seconds,
      actual_seconds,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'reset')`,
    [
      createId('session'),
      task.id,
      task.title,
      task.category,
      timer.phase,
      timer.startedAt,
      endedAt,
      timer.plannedSeconds,
      actualSeconds,
    ]
  );
}

export async function getSessionsBetween(
  db: SQLiteDatabase,
  startIso: string,
  endIso: string
): Promise<FocusSession[]> {
  const rows = await db.getAllAsync<SessionRow>(
    `SELECT * FROM focus_sessions
     WHERE started_at >= ? AND started_at < ? AND status = 'completed'
     ORDER BY started_at ASC`,
    [startIso, endIso]
  );

  return rows.map((row) => ({
    id: row.id,
    taskId: row.task_id,
    taskTitle: row.task_title,
    category: row.category,
    phase: row.phase_type,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    plannedSeconds: row.planned_seconds,
    actualSeconds: row.actual_seconds,
    status: row.status,
  }));
}

async function getActiveTimer(db: SQLiteDatabase): Promise<ActiveTimer | null> {
  const row = await db.getFirstAsync<TimerRow>('SELECT * FROM active_timer WHERE id = 1');

  if (!row) {
    return null;
  }

  return {
    taskId: row.task_id,
    phase: row.phase_type,
    status: row.status,
    startedAt: row.started_at,
    dueAt: row.due_at,
    plannedSeconds: row.planned_seconds,
    remainingSeconds: row.remaining_seconds,
    completedFocusCount: row.completed_focus_count,
    updatedAt: row.updated_at,
  };
}

async function upsertTimer(
  db: SQLiteDatabase,
  input: {
    task: FocusTask;
    phase: TimerPhase;
    status: TimerStatus;
    plannedSeconds: number;
    remainingSeconds: number;
    completedFocusCount: number;
  }
) {
  const now = new Date();
  const nowIso = now.toISOString();
  const dueAt =
    input.status === 'running'
      ? new Date(now.getTime() + input.remainingSeconds * 1000).toISOString()
      : null;

  await db.runAsync(
    `INSERT INTO active_timer (
      id,
      task_id,
      phase_type,
      status,
      started_at,
      due_at,
      planned_seconds,
      remaining_seconds,
      completed_focus_count,
      updated_at
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      task_id = excluded.task_id,
      phase_type = excluded.phase_type,
      status = excluded.status,
      started_at = excluded.started_at,
      due_at = excluded.due_at,
      planned_seconds = excluded.planned_seconds,
      remaining_seconds = excluded.remaining_seconds,
      completed_focus_count = excluded.completed_focus_count,
      updated_at = excluded.updated_at`,
    [
      input.task.id,
      input.phase,
      input.status,
      nowIso,
      dueAt,
      input.plannedSeconds,
      input.remainingSeconds,
      input.completedFocusCount,
      nowIso,
    ]
  );
}

function mapTask(row: TaskRow): FocusTask {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    focusMinutes: row.focus_minutes,
    shortBreakMinutes: row.short_break_minutes,
    longBreakMinutes: row.long_break_minutes,
    sessions: row.sessions_before_long_break,
    sound: row.sound,
    backgroundSound: row.background_sound,
    autoStartBreaks: row.auto_start_breaks === 1,
    sortOrder: row.sort_order,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function nextTaskOrder(db: SQLiteDatabase) {
  return db
    .getFirstAsync<{ max_order: number | null }>('SELECT MAX(sort_order) as max_order FROM tasks')
    .then((row) => (row?.max_order ?? 0) + 1);
}

function resolveRemainingSeconds(timer: ActiveTimer) {
  if (timer.status === 'paused' || !timer.dueAt) {
    return timer.remainingSeconds;
  }

  return Math.max(0, Math.ceil((new Date(timer.dueAt).getTime() - Date.now()) / 1000));
}

export function formatSeconds(seconds: number) {
  const safeSeconds = Math.max(seconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function normalizeTitle(title: string) {
  const normalized = title.trim();
  return normalized || 'Untitled Task';
}

function clampMinutes(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(Math.round(value), min), max);
}

function readNumberSetting(settings: Map<string, string>, key: string, fallback: number) {
  const parsed = Number(settings.get(key));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
