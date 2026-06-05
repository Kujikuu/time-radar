const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const source = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

test('PrimaryButton exposes button label, disabled state, and native disabled prop', () => {
  const primaryButtonSource = source('src/components/PrimaryButton.tsx');

  assert.match(primaryButtonSource, /accessibilityLabel=\{resolvedAccessibilityLabel\}/);
  assert.match(primaryButtonSource, /accessibilityState=\{\{\s*disabled\s*\}\}/s);
  assert.match(primaryButtonSource, /disabled=\{disabled\}/);
});

test('SegmentedControl exposes each option label and selected state', () => {
  const segmentedControlSource = source('src/components/SegmentedControl.tsx');

  assert.match(segmentedControlSource, /accessibilityLabel=\{option\}/);
  assert.match(segmentedControlSource, /accessibilityState=\{\{\s*selected:\s*isActive\s*\}\}/s);
});

test('TimerRing labels timer actions for assistive technology', () => {
  const timerRingSource = source('src/features/focus/TimerRing.tsx');

  assert.match(timerRingSource, /accessibilityLabel=\{displayAction\}/);
  assert.match(timerRingSource, /accessibilityLabel="Reset timer"/);
  assert.match(timerRingSource, /accessibilityLabel="Complete current phase"/);
});

test('FocusTaskCard exposes a descriptive task action label', () => {
  const focusTaskCardSource = source('src/features/focus/FocusTaskCard.tsx');

  assert.match(
    focusTaskCardSource,
    /accessibilityLabel=\{`Open \$\{task\.title\} focus task, \$\{task\.focusMinutes\} minutes`\}/
  );
});

test('TaskForm exposes form input labels', () => {
  const taskFormSource = source('src/features/focus/TaskForm.tsx');

  assert.match(taskFormSource, /accessibilityLabel="Task name"/);
  assert.match(taskFormSource, /accessibilityLabel=\{label\}/);
});
