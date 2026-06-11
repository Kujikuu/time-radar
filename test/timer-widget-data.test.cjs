const test = require('node:test');
const assert = require('node:assert/strict');

const { formatTimerWidgetData } = require('../.test-build/widgets/timer-widget-data.js');

test('returns null when timer is null', () => {
  assert.deepStrictEqual(formatTimerWidgetData(null), null);
});

test('formats running focus session', () => {
  const result = formatTimerWidgetData({
    taskTitle: 'Project Proposal',
    phase: 'focus',
    status: 'running',
    remainingSeconds: 1245,
    plannedSeconds: 1500,
  });
  assert.strictEqual(result.taskTitle, 'Project Proposal');
  assert.strictEqual(result.phase, 'Focus');
  assert.strictEqual(result.status, 'running');
  assert.strictEqual(result.remainingSeconds, 1245);
  assert.strictEqual(result.plannedSeconds, 1500);
  assert.strictEqual(result.displayTime, '20:45');
  assert.strictEqual(result.progress, 0.17);
  assert.ok(typeof result.updatedAt === 'string');
});

test('formats paused short break', () => {
  const result = formatTimerWidgetData({
    taskTitle: 'Market Research',
    phase: 'short_break',
    status: 'paused',
    remainingSeconds: 300,
    plannedSeconds: 300,
  });
  assert.strictEqual(result.taskTitle, 'Market Research');
  assert.strictEqual(result.phase, 'Short Break');
  assert.strictEqual(result.status, 'paused');
  assert.strictEqual(result.remainingSeconds, 300);
  assert.strictEqual(result.plannedSeconds, 300);
  assert.strictEqual(result.displayTime, '05:00');
  assert.strictEqual(result.progress, 0);
});

test('formats long break', () => {
  const result = formatTimerWidgetData({
    taskTitle: 'Weekly Review',
    phase: 'long_break',
    status: 'running',
    remainingSeconds: 600,
    plannedSeconds: 900,
  });
  assert.strictEqual(result.taskTitle, 'Weekly Review');
  assert.strictEqual(result.phase, 'Long Break');
  assert.strictEqual(result.status, 'running');
  assert.strictEqual(result.remainingSeconds, 600);
  assert.strictEqual(result.plannedSeconds, 900);
  assert.strictEqual(result.displayTime, '10:00');
  assert.strictEqual(result.progress, 0.33);
});

test('clamps progress between 0 and 1', () => {
  const result = formatTimerWidgetData({
    taskTitle: 'Test',
    phase: 'focus',
    status: 'running',
    remainingSeconds: -10,
    plannedSeconds: 1500,
  });
  assert.strictEqual(result.progress, 1);
});

test('returns 0 progress when plannedSeconds is 0', () => {
  const result = formatTimerWidgetData({
    taskTitle: 'Test',
    phase: 'focus',
    status: 'running',
    remainingSeconds: 0,
    plannedSeconds: 0,
  });
  assert.strictEqual(result.progress, 0);
});
