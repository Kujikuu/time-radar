import { type SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'time-radar.db';

const DATABASE_VERSION = 1;

const seedTasks = [
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
    autoStartBreaks: 1,
    sortOrder: 1,
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
    autoStartBreaks: 0,
    sortOrder: 2,
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
    autoStartBreaks: 1,
    sortOrder: 3,
  },
] as const;

export async function migrateDatabase(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL');

  await db.withTransactionAsync(async () => {
    const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const currentVersion = result?.user_version ?? 0;

    if (currentVersion >= DATABASE_VERSION) {
      return;
    }

    if (currentVersion === 0) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          category TEXT NOT NULL CHECK (category IN ('Work', 'Study', 'Personal')),
          focus_minutes INTEGER NOT NULL,
          short_break_minutes INTEGER NOT NULL,
          long_break_minutes INTEGER NOT NULL,
          sessions_before_long_break INTEGER NOT NULL,
          sound TEXT NOT NULL,
          background_sound TEXT NOT NULL,
          auto_start_breaks INTEGER NOT NULL DEFAULT 1,
          sort_order INTEGER NOT NULL DEFAULT 0,
          archived_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS focus_sessions (
          id TEXT PRIMARY KEY NOT NULL,
          task_id TEXT,
          task_title TEXT NOT NULL,
          category TEXT NOT NULL CHECK (category IN ('Work', 'Study', 'Personal')),
          phase_type TEXT NOT NULL CHECK (phase_type IN ('focus', 'short_break', 'long_break')),
          started_at TEXT NOT NULL,
          ended_at TEXT NOT NULL,
          planned_seconds INTEGER NOT NULL,
          actual_seconds INTEGER NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('completed', 'reset')),
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS active_timer (
          id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
          task_id TEXT NOT NULL,
          phase_type TEXT NOT NULL CHECK (phase_type IN ('focus', 'short_break', 'long_break')),
          status TEXT NOT NULL CHECK (status IN ('running', 'paused')),
          started_at TEXT NOT NULL,
          due_at TEXT,
          planned_seconds INTEGER NOT NULL,
          remaining_seconds INTEGER NOT NULL,
          completed_focus_count INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS focus_sessions_started_at_idx ON focus_sessions(started_at);
        CREATE INDEX IF NOT EXISTS focus_sessions_task_id_idx ON focus_sessions(task_id);
        CREATE INDEX IF NOT EXISTS tasks_sort_order_idx ON tasks(sort_order);
      `);

      await seedInitialData(db);
    }

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  });
}

async function seedInitialData(db: SQLiteDatabase) {
  const now = new Date().toISOString();
  const taskCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM tasks');

  if ((taskCount?.count ?? 0) === 0) {
    for (const task of seedTasks) {
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
          task.id,
          task.title,
          task.category,
          task.focusMinutes,
          task.shortBreakMinutes,
          task.longBreakMinutes,
          task.sessions,
          task.sound,
          task.backgroundSound,
          task.autoStartBreaks,
          task.sortOrder,
          now,
          now,
        ]
      );
    }
  }

  const defaults = {
    onboarding_completed: 'false',
    default_focus_minutes: '25',
    default_short_break_minutes: '5',
    default_long_break_minutes: '15',
    default_sessions: '4',
    default_sound: 'Soft Bell',
    default_background_sound: 'None',
    auto_start_breaks: 'true',
  };

  for (const [key, value] of Object.entries(defaults)) {
    await db.runAsync(
      'INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)',
      [key, value, now]
    );
  }
}
