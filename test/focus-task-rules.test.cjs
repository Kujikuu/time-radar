const test = require('node:test');
const assert = require('node:assert/strict');

const taskRules = require('../.test-build/features/focus/task-rules.js');

const settings = {
  defaultFocusMinutes: 25,
  defaultShortBreakMinutes: 5,
  defaultLongBreakMinutes: 15,
  defaultSessions: 4,
  defaultSound: 'Soft Bell',
  defaultBackgroundSound: 'None',
  autoStartBreaks: true,
};

test('quickFocusTaskInput creates a work focus block from current timer defaults', () => {
  assert.deepEqual(taskRules.quickFocusTaskInput(settings, 'Quick Focus Block'), {
    title: 'Quick Focus Block',
    category: 'Work',
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessions: 4,
    sound: 'Soft Bell',
    backgroundSound: 'None',
    autoStartBreaks: true,
  });
});
