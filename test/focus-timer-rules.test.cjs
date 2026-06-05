const test = require('node:test');
const assert = require('node:assert/strict');

const timerRules = require('../.test-build/features/focus/timer-rules.js');
const notificationRules = require('../.test-build/features/focus/notification-rules.js');

const task = {
  id: 'proposal',
  title: 'Proposal',
  category: 'Work',
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessions: 2,
  sound: 'Soft Bell',
  backgroundSound: 'None',
  autoStartBreaks: true,
  sortOrder: 1,
  archivedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const settings = {
  onboardingCompleted: true,
  defaultFocusMinutes: 25,
  defaultShortBreakMinutes: 5,
  defaultLongBreakMinutes: 15,
  defaultSessions: 2,
  defaultSound: 'Soft Bell',
  defaultBackgroundSound: 'None',
  autoStartBreaks: true,
  notificationsEnabled: true,
  focusCompleteNotificationsEnabled: true,
  breakCompleteNotificationsEnabled: true,
  completionSoundEnabled: true,
  timerWarningEnabled: true,
  timerWarningSeconds: 60,
  hapticsEnabled: true,
};

test('focus phase advances to short break before the long-break threshold', () => {
  const transition = timerRules.resolveCompletedTimerTransition({
    task,
    currentPhase: 'focus',
    completedFocusCount: 0,
  });

  assert.equal(transition.completedFocusCount, 1);
  assert.equal(transition.nextPhase, 'short_break');
  assert.equal(transition.nextStatus, 'running');
  assert.equal(transition.nextSeconds, 5 * 60);
});

test('focus phase advances to long break at the configured threshold', () => {
  const transition = timerRules.resolveCompletedTimerTransition({
    task,
    currentPhase: 'focus',
    completedFocusCount: 1,
  });

  assert.equal(transition.completedFocusCount, 2);
  assert.equal(transition.nextPhase, 'long_break');
  assert.equal(transition.nextStatus, 'running');
  assert.equal(transition.nextSeconds, 15 * 60);
});

test('break phase advances back to a paused focus session', () => {
  const transition = timerRules.resolveCompletedTimerTransition({
    task,
    currentPhase: 'short_break',
    completedFocusCount: 1,
  });

  assert.equal(transition.completedFocusCount, 1);
  assert.equal(transition.nextPhase, 'focus');
  assert.equal(transition.nextStatus, 'paused');
  assert.equal(transition.nextSeconds, 25 * 60);
});

test('notification plan schedules completion and focus warning when eligible', () => {
  const plan = notificationRules.resolveTimerNotificationPlan({
    phase: 'focus',
    dueAt: '2026-01-01T10:25:00.000Z',
    settings,
    nowMs: Date.parse('2026-01-01T10:00:00.000Z'),
  });

  assert.equal(plan.completionDelaySeconds, 25 * 60);
  assert.equal(plan.warningDelaySeconds, 24 * 60);
});

test('notification plan skips disabled break alerts and expired timers', () => {
  const disabledBreakPlan = notificationRules.resolveTimerNotificationPlan({
    phase: 'short_break',
    dueAt: '2026-01-01T10:05:00.000Z',
    settings: { ...settings, breakCompleteNotificationsEnabled: false },
    nowMs: Date.parse('2026-01-01T10:00:00.000Z'),
  });
  const expiredPlan = notificationRules.resolveTimerNotificationPlan({
    phase: 'focus',
    dueAt: '2026-01-01T10:00:00.000Z',
    settings,
    nowMs: Date.parse('2026-01-01T10:01:00.000Z'),
  });

  assert.equal(disabledBreakPlan.completionDelaySeconds, null);
  assert.equal(disabledBreakPlan.warningDelaySeconds, null);
  assert.equal(expiredPlan.completionDelaySeconds, null);
  assert.equal(expiredPlan.warningDelaySeconds, null);
});
