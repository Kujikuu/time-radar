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

test('TimerRing exposes an optional accessible surface press without forcing secondary actions', () => {
  const timerRingSource = source('src/features/focus/TimerRing.tsx');

  assert.match(timerRingSource, /onSurfacePress\?: \(\) => void/);
  assert.match(timerRingSource, /showSecondaryActions\?: boolean/);
  assert.match(timerRingSource, /accessibilityLabel=\{surfaceAccessibilityLabel\}/);
  assert.match(timerRingSource, /showSecondaryActions && hasActiveTimer/);
});

test('ImmersiveTimerView keeps the timer awake and exits through double tap', () => {
  const immersiveTimerPath = path.join(
    __dirname,
    '..',
    'src/features/focus/ImmersiveTimerView.tsx'
  );

  assert.ok(fs.existsSync(immersiveTimerPath), 'ImmersiveTimerView.tsx should exist');

  const immersiveTimerSource = fs.readFileSync(immersiveTimerPath, 'utf8');

  assert.match(immersiveTimerSource, /useKeepAwake\('time-radar-immersive-timer'\)/);
  assert.match(immersiveTimerSource, /<StatusBar hidden/);
  assert.match(immersiveTimerSource, /DOUBLE_TAP_THRESHOLD_MS = 320/);
  assert.match(immersiveTimerSource, /showSecondaryActions=\{false\}/);
});

test('FocusTaskCard exposes a descriptive task action label', () => {
  const focusTaskCardSource = source('src/features/focus/FocusTaskCard.tsx');

  assert.match(
    focusTaskCardSource,
    /accessibilityLabel=\{t\('tasks\.openTask'/
  );
});

test('SwipeableTaskRow exposes a leading-side swipe remove action and accessible fallback', () => {
  const swipeableTaskRowPath = path.join(
    __dirname,
    '..',
    'src/features/focus/SwipeableTaskRow.tsx'
  );

  assert.ok(fs.existsSync(swipeableTaskRowPath), 'SwipeableTaskRow.tsx should exist');

  const swipeableTaskRowSource = fs.readFileSync(swipeableTaskRowPath, 'utf8');

  assert.match(swipeableTaskRowSource, /GestureDetector/);
  assert.match(swipeableTaskRowSource, /Gesture\.Pan\(\)/);
  assert.match(swipeableTaskRowSource, /SWIPE_ACTION_WIDTH = 112/);
  assert.match(swipeableTaskRowSource, /direction === 'rtl' \? -SWIPE_ACTION_WIDTH : SWIPE_ACTION_WIDTH/);
  assert.match(swipeableTaskRowSource, /direction === 'rtl' \? styles\.actionOnRight : styles\.actionOnLeft/);
  assert.match(swipeableTaskRowSource, /translateX\.value = withSpring/);
  assert.match(swipeableTaskRowSource, /accessibilityActions=\{\[\{ name: 'remove'/);
  assert.match(swipeableTaskRowSource, /onAccessibilityAction=\{handleAccessibilityAction\}/);
  assert.match(swipeableTaskRowSource, /t\('tasks\.removeTask'/);
});

test('Task removal undo toast expires and cleans up its timer', () => {
  const tasksSource = source('app/(tabs)/tasks.tsx');

  assert.match(tasksSource, /TASK_REMOVAL_UNDO_TIMEOUT_MS = 4000/);
  assert.match(tasksSource, /useRef<ReturnType<typeof setTimeout> \| null>\(null\)/);
  assert.match(tasksSource, /setTimeout\(\(\) => \{\s*setRemovedTask\(null\);/s);
  assert.match(tasksSource, /clearTimeout\(undoDismissTimerRef\.current\)/);
});

test('TaskForm exposes form input labels', () => {
  const taskFormSource = source('src/features/focus/TaskForm.tsx');
  const sharedControlsSource = source('src/components/ControlRows.tsx');

  assert.match(taskFormSource, /accessibilityLabel=\{t\('taskForm\.taskNameA11y'\)\}/);
  assert.match(sharedControlsSource, /accessibilityLabel=\{label\}/);
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
  const sharedControlsSource = source('src/components/ControlRows.tsx');

  assert.match(settingsSource, /textAlignForTextDirection\(direction\)/);
  assert.match(sharedControlsSource, /rowDirectionForTextDirection\(direction,\s*nativeDirection\)/);
  assert.match(settingsSource, /styles\.tileText/);
  assert.match(sharedControlsSource, /styles\.controlRow/);
});

test('Settings section headers keep titles anchored to the row start', () => {
  const settingsSectionSource = source('src/components/SettingsSection.tsx');
  const sectionHeaderStyle = settingsSectionSource.match(/sectionHeader:\s*\{([\s\S]*?)\n  \},/)?.[1] ?? '';
  const sectionTitleWrapStyle =
    settingsSectionSource.match(/sectionTitleWrap:\s*\{([\s\S]*?)\n  \},/)?.[1] ?? '';
  const sectionTitleStyle =
    settingsSectionSource.match(/sectionTitle:\s*\{([\s\S]*?)\n  \},/)?.[1] ?? '';

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

test('FocusBarChart renders x-axis labels with native text for Arabic shaping', () => {
  const focusBarChartSource = source('src/features/focus/FocusBarChart.tsx');

  assert.match(focusBarChartSource, /import \{ AppText \} from '@\/src\/components'/);
  assert.match(focusBarChartSource, /styles\.axisLabels/);
  assert.doesNotMatch(focusBarChartSource, /<SvgText[\s\S]*\{bar\.label\}[\s\S]*<\/SvgText>/);
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
  const sharedControlsSource = source('src/components/ControlRows.tsx');

  assert.match(taskFormSource, /<SwitchRow/);
  assert.match(sharedControlsSource, /textAlignForTextDirection\(direction\)/);
  assert.match(sharedControlsSource, /rowDirectionForTextDirection\(direction,\s*nativeDirection\)/);
  assert.match(sharedControlsSource, /styles\.tileText/);
});

test('StepperRow and SwitchRow are reusable shared controls used by settings and task forms', () => {
  const sharedControlsSource = source('src/components/ControlRows.tsx');
  const settingsSource = source('app/(tabs)/settings.tsx');
  const taskFormSource = source('src/features/focus/TaskForm.tsx');

  assert.match(sharedControlsSource, /export function StepperRow/);
  assert.match(sharedControlsSource, /export function SwitchRow/);
  assert.match(settingsSource, /import \{[\s\S]*StepperRow[\s\S]*SwitchRow[\s\S]*\} from '@\/src\/components'/);
  assert.match(taskFormSource, /import \{[\s\S]*StepperRow[\s\S]*SwitchRow[\s\S]*\} from '@\/src\/components'/);
  assert.doesNotMatch(settingsSource, /function StepperRow/);
  assert.doesNotMatch(settingsSource, /function SwitchRow/);
  assert.doesNotMatch(taskFormSource, /<TextInput[\s\S]*keyboardType="number-pad"/);
});
