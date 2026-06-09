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

test('repository exposes archive, restore, and active-task removal APIs', () => {
  const repositorySource = require('node:fs').readFileSync(
    require('node:path').join(__dirname, '..', 'src/features/focus/repository.ts'),
    'utf8'
  );
  const hooksSource = require('node:fs').readFileSync(
    require('node:path').join(__dirname, '..', 'src/features/focus/hooks.ts'),
    'utf8'
  );

  assert.match(repositorySource, /export async function archiveTask/);
  assert.match(repositorySource, /archived_at = \?/);
  assert.match(repositorySource, /export async function restoreTask/);
  assert.match(repositorySource, /archived_at = NULL/);
  assert.match(repositorySource, /export async function removeActiveTask/);
  assert.match(repositorySource, /await resetTimer\(db\)/);
  assert.match(hooksSource, /export function useTaskRemoval/);
  assert.match(hooksSource, /cancelTimerNotifications\(\)/);
});
