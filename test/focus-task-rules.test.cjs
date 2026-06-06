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

test('quickStudyTaskInput creates a study sprint from current timer defaults', () => {
  assert.deepEqual(taskRules.quickStudyTaskInput(settings, 'Quick Study Sprint'), {
    title: 'Quick Study Sprint',
    category: 'Study',
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessions: 4,
    sound: 'Soft Bell',
    backgroundSound: 'None',
    autoStartBreaks: true,
  });
});
