import type { AppSettings, TaskInput } from './types';

export function quickStudyTaskInput(settings: AppSettings, title: string): TaskInput {
  return {
    title,
    category: 'Study',
    focusMinutes: settings.defaultFocusMinutes,
    shortBreakMinutes: settings.defaultShortBreakMinutes,
    longBreakMinutes: settings.defaultLongBreakMinutes,
    sessions: settings.defaultSessions,
    sound: settings.defaultSound,
    backgroundSound: settings.defaultBackgroundSound,
    autoStartBreaks: settings.autoStartBreaks,
  };
}
