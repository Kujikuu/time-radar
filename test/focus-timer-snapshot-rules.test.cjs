const assert = require('node:assert/strict');
const test = require('node:test');

const {
  resolvePhaseLabel,
  resolvePrimaryActionLabel,
  resolveTimerProgress,
} = require('../.test-build/features/focus/timer-snapshot-rules.js');

test('resolveTimerProgress returns zero before timer progress starts', () => {
  assert.equal(resolveTimerProgress({ plannedSeconds: 1500, remainingSeconds: 1500 }), 0);
});

test('resolveTimerProgress returns fractional progress for elapsed time', () => {
  assert.equal(resolveTimerProgress({ plannedSeconds: 1500, remainingSeconds: 750 }), 0.5);
});

test('resolveTimerProgress caps progress at one when remaining time is negative', () => {
  assert.equal(resolveTimerProgress({ plannedSeconds: 1500, remainingSeconds: -20 }), 1);
});

test('resolveTimerProgress returns zero when planned time is not positive', () => {
  assert.equal(resolveTimerProgress({ plannedSeconds: 0, remainingSeconds: 0 }), 0);
});

test('resolvePhaseLabel returns display labels for timer phases', () => {
  assert.equal(resolvePhaseLabel('focus'), 'Focus');
  assert.equal(resolvePhaseLabel('short_break'), 'Short Break');
  assert.equal(resolvePhaseLabel('long_break'), 'Long Break');
});

test('resolvePrimaryActionLabel returns the timer control label', () => {
  assert.equal(resolvePrimaryActionLabel(null), 'Start');
  assert.equal(resolvePrimaryActionLabel({ status: 'running' }), 'Pause');
  assert.equal(resolvePrimaryActionLabel({ status: 'paused' }), 'Resume');
});
