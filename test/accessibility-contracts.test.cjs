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

  assert.match(segmentedControlSource, /accessibilityLabel=\{label\}/);
  assert.match(segmentedControlSource, /accessibilityState=\{\{\s*selected:\s*isActive\s*\}\}/s);
  assert.match(segmentedControlSource, /rowDirectionForTextDirection\(direction,\s*nativeDirection\)/);
});

test('TimerRing labels timer actions for assistive technology', () => {
  const timerRingSource = source('src/features/focus/TimerRing.tsx');

  assert.match(timerRingSource, /accessibilityLabel=\{displayAction\}/);
  assert.match(timerRingSource, /accessibilityLabel=\{t\('timer\.actions\.reset'\)\}/);
  assert.match(timerRingSource, /accessibilityLabel=\{t\('timer\.actions\.complete'\)\}/);
});

test('FocusTaskCard exposes a descriptive task action label', () => {
  const focusTaskCardSource = source('src/features/focus/FocusTaskCard.tsx');

  assert.match(
    focusTaskCardSource,
    /accessibilityLabel=\{t\('tasks\.openTask'/
  );
});

test('TaskForm exposes form input labels', () => {
  const taskFormSource = source('src/features/focus/TaskForm.tsx');

  assert.match(taskFormSource, /accessibilityLabel=\{t\('taskForm\.taskNameA11y'\)\}/);
  assert.match(taskFormSource, /accessibilityLabel=\{label\}/);
});

test('Settings exposes language as a header icon toggle', () => {
  const settingsSource = source('app/(tabs)/settings.tsx');

  assert.match(settingsSource, /IconLanguage/);
  assert.match(settingsSource, /languageTogglePreferenceForLocale\(locale\)/);
  assert.match(settingsSource, /label=\{languageToggleLabel\}/);
  assert.doesNotMatch(settingsSource, /SettingsSection title=\{t\('settings\.language'\)\}/);
});

test('Settings aligns tile copy and control rows to the active reading direction', () => {
  const settingsSource = source('app/(tabs)/settings.tsx');

  assert.match(settingsSource, /textAlignForTextDirection\(direction\)/);
  assert.match(settingsSource, /rowDirectionForTextDirection\(direction,\s*nativeDirection\)/);
  assert.match(settingsSource, /styles\.tileText/);
  assert.match(settingsSource, /styles\.controlRow/);
});

test('Settings section headers keep titles anchored to the row start', () => {
  const settingsSource = source('app/(tabs)/settings.tsx');
  const sectionHeaderStyle = settingsSource.match(/sectionHeader:\s*\{([\s\S]*?)\n  \},/)?.[1] ?? '';
  const sectionTitleWrapStyle =
    settingsSource.match(/sectionTitleWrap:\s*\{([\s\S]*?)\n  \},/)?.[1] ?? '';
  const sectionTitleStyle = settingsSource.match(/sectionTitle:\s*\{([\s\S]*?)\n  \},/)?.[1] ?? '';

  assert.match(sectionHeaderStyle, /alignItems:\s*'flex-start'/);
  assert.match(sectionHeaderStyle, /justifyContent:\s*'space-between'/);
  assert.match(sectionTitleWrapStyle, /alignItems:\s*'flex-start'/);
  assert.doesNotMatch(sectionTitleWrapStyle, /alignItems:\s*'center'/);
  assert.match(sectionTitleStyle, /alignSelf:\s*'stretch'/);
});

test('LocaleProvider uses web dir as the effective mirrored row direction', () => {
  const localeProviderSource = source('src/i18n/LocaleProvider.tsx');

  assert.match(localeProviderSource, /Platform\.OS === 'web' \? direction/);
  assert.match(localeProviderSource, /I18nManager\.isRTL \? 'rtl' : 'ltr'/);
});

test('Stats content aligns and metric rows follow the active reading direction', () => {
  const statsSource = source('app/(tabs)/stats.tsx');
  const distributionSource = source('src/features/focus/DistributionDonut.tsx');

  assert.match(statsSource, /textAlignForTextDirection\(direction\)/);
  assert.match(statsSource, /rowDirectionForTextDirection\(direction,\s*nativeDirection\)/);
  assert.match(statsSource, /styles\.contentText/);
  assert.match(distributionSource, /textAlignForTextDirection\(direction\)/);
  assert.match(distributionSource, /rowDirectionForTextDirection\(direction,\s*nativeDirection\)/);
});

test('Task cards align copy and rows to the active reading direction', () => {
  const tasksSource = source('app/(tabs)/tasks.tsx');
  const focusTaskCardSource = source('src/features/focus/FocusTaskCard.tsx');

  assert.match(tasksSource, /textAlignForTextDirection\(direction\)/);
  assert.match(tasksSource, /rowDirectionForTextDirection\(direction,\s*nativeDirection\)/);
  assert.match(focusTaskCardSource, /textAlignForTextDirection\(direction\)/);
  assert.match(focusTaskCardSource, /rowDirectionForTextDirection\(direction,\s*nativeDirection\)/);
});

test('Create task back button uses the directional chevron for RTL', () => {
  const newTaskSource = source('app/task/new.tsx');

  assert.match(newTaskSource, /IconChevronRight/);
  assert.match(newTaskSource, /direction === 'rtl' \? IconChevronRight : IconChevronLeft/);
});

test('Auto start breaks toggle copy aligns to the active reading direction', () => {
  const taskFormSource = source('src/features/focus/TaskForm.tsx');

  assert.match(taskFormSource, /textAlignForTextDirection\(direction\)/);
  assert.match(taskFormSource, /rowDirectionForTextDirection\(direction,\s*nativeDirection\)/);
  assert.match(taskFormSource, /styles\.toggleText/);
});
