const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const source = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

test('Screen owns automatic scroll insets and centered wide content', () => {
  const screenSource = source('src/components/Screen.tsx');

  assert.match(screenSource, /contentInsetAdjustmentBehavior="automatic"/);
  assert.match(screenSource, /keyboardShouldPersistTaps="handled"/);
  assert.match(screenSource, /styles\.contentWide/);
  assert.match(screenSource, /maxWidth:\s*1100/);
  assert.match(screenSource, /alignSelf:\s*'center'/);
});

test('Shared card and undo toast use modern boxShadow instead of legacy native shadows', () => {
  const softCardSource = source('src/components/SoftCard.tsx');
  const tasksSource = source('src/features/focus/TasksListScreen.tsx');

  assert.match(softCardSource, /boxShadow:\s*'0 8px 22px rgba\(31, 26, 23, 0\.05\)'/);
  assert.match(tasksSource, /boxShadow:\s*'0 10px 24px rgba\(31, 26, 23, 0\.18\)'/);
  assert.doesNotMatch(tasksSource, /shadowColor|shadowOffset|shadowOpacity|shadowRadius|elevation/);
});

test('Shared rounded primitives opt into continuous corners', () => {
  const softCardSource = source('src/components/SoftCard.tsx');
  const primaryButtonSource = source('src/components/PrimaryButton.tsx');
  const iconButtonSource = source('src/components/IconButton.tsx');
  const segmentedControlSource = source('src/components/SegmentedControl.tsx');

  assert.match(softCardSource, /borderCurve:\s*'continuous'/);
  assert.match(primaryButtonSource, /borderCurve:\s*'continuous'/);
  assert.match(iconButtonSource, /borderCurve:\s*'continuous'/);
  assert.match(segmentedControlSource, /borderCurve:\s*'continuous'/);
});

test('Shared controls preserve at least 44px touch targets', () => {
  const iconButtonSource = source('src/components/IconButton.tsx');
  const controlRowsSource = source('src/components/ControlRows.tsx');
  const segmentedControlSource = source('src/components/SegmentedControl.tsx');
  const focusTaskCardSource = source('src/features/focus/FocusTaskCard.tsx');
  const timerRingSource = source('src/features/focus/TimerRing.tsx');

  assert.match(iconButtonSource, /width:\s*44/);
  assert.match(iconButtonSource, /height:\s*44/);
  assert.match(controlRowsSource, /width:\s*44/);
  assert.match(controlRowsSource, /height:\s*44/);
  assert.match(controlRowsSource, /hitSlop=\{12\}/);
  assert.match(controlRowsSource, /switchControl:\s*\{[\s\S]*minWidth:\s*44/);
  assert.match(controlRowsSource, /switchControl:\s*\{[\s\S]*minHeight:\s*44/);
  assert.match(segmentedControlSource, /minHeight:\s*52/);
  assert.match(segmentedControlSource, /minHeight:\s*44/);
  assert.match(focusTaskCardSource, /width:\s*44/);
  assert.match(focusTaskCardSource, /height:\s*44/);
  assert.match(timerRingSource, /minHeight:\s*44/);
});

test('Secondary route actions keep accessible touch targets', () => {
  const homeSource = source('app/(tabs)/index.tsx');
  const statsSource = source('app/(tabs)/stats.tsx');
  const settingsSource = source('app/(tabs)/settings.tsx');
  const tasksSource = source('src/features/focus/TasksListScreen.tsx');
  const onboardingSource = source('app/index.tsx');

  assert.match(homeSource, /statsLinkButton:\s*\{[\s\S]*minHeight:\s*44/);
  assert.match(homeSource, /dismissButton:\s*\{[\s\S]*minHeight:\s*44/);
  assert.match(statsSource, /restoreButton:\s*\{[\s\S]*minHeight:\s*44/);
  assert.match(settingsSource, /permissionButton:\s*\{[\s\S]*minHeight:\s*44/);
  assert.match(settingsSource, /systemSettingsButton:\s*\{[\s\S]*minHeight:\s*44/);
  assert.match(settingsSource, /supportButton:\s*\{[\s\S]*minHeight:\s*44/);
  assert.match(tasksSource, /undoAction:\s*\{[\s\S]*minHeight:\s*44/);
  assert.match(onboardingSource, /skipButton:\s*\{[\s\S]*minHeight:\s*44/);
  assert.doesNotMatch(onboardingSource, /hitSlop=\{10\}/);
  assert.match(onboardingSource, /dotButton:\s*\{[\s\S]*width:\s*44/);
  assert.match(onboardingSource, /dotButton:\s*\{[\s\S]*height:\s*44/);
});

test('Active task removal uses an app-styled confirmation modal', () => {
  const tasksSource = source('src/features/focus/TasksListScreen.tsx');

  assert.doesNotMatch(tasksSource, /Alert\.alert/);
  assert.doesNotMatch(tasksSource, /import \{[^}]*Alert/);
  assert.match(tasksSource, /Modal/);
  assert.match(tasksSource, /pendingRemovalTask/);
  assert.match(tasksSource, /visible=\{Boolean\(pendingRemovalTask\)\}/);
  assert.match(tasksSource, /t\('tasks\.removeActiveTitle'\)/);
  assert.match(tasksSource, /t\('tasks\.removeActiveBody'/);
  assert.match(tasksSource, /t\('tasks\.removeActiveConfirm'\)/);
  assert.match(tasksSource, /t\('common\.cancel'\)/);
  assert.match(tasksSource, /confirmPanel:\s*\{[\s\S]*borderCurve:\s*'continuous'/);
  assert.match(tasksSource, /confirmAction:\s*\{[\s\S]*minHeight:\s*44/);
  assert.match(tasksSource, /confirmCancelAction:\s*\{[\s\S]*minHeight:\s*44/);
});

test('Screen titles use the shared ScreenHeader primitive', () => {
  const componentIndexSource = source('src/components/index.ts');
  const screenHeaderPath = path.join(__dirname, '..', 'src/components/ScreenHeader.tsx');
  const statsSource = source('app/(tabs)/stats.tsx');
  const settingsSource = source('app/(tabs)/settings.tsx');
  const tasksSource = source('src/features/focus/TasksListScreen.tsx');
  const newTaskSource = source('app/task/new.tsx');
  const taskDetailSource = source('src/features/focus/TaskDetailContent.tsx');

  assert.ok(fs.existsSync(screenHeaderPath), 'ScreenHeader.tsx should exist');

  const screenHeaderSource = fs.readFileSync(screenHeaderPath, 'utf8');

  assert.match(componentIndexSource, /export \{ ScreenHeader \} from '\.\/ScreenHeader'/);
  assert.match(screenHeaderSource, /rowDirectionForTextDirection\(direction,\s*nativeDirection\)/);
  assert.match(screenHeaderSource, /titleSize\?: 'screen' \| 'compact'/);
  assert.match(screenHeaderSource, /edgePlaceholder/);

  for (const routeSource of [statsSource, settingsSource, tasksSource, newTaskSource, taskDetailSource]) {
    assert.match(routeSource, /ScreenHeader/);
    assert.doesNotMatch(routeSource, /header:\s*\{/);
  }
});

test('Focus haptics are gated to native iOS only', () => {
  const hapticsSource = source('src/features/focus/haptics.ts');

  assert.match(hapticsSource, /process\.env\.EXPO_OS !== 'ios'/);
});

test('Task detail screen has a localized detail title and continuous metadata pill', () => {
  const taskDetailSource = source('src/features/focus/TaskDetailContent.tsx');
  const i18nSource = source('src/i18n/index.ts');

  assert.match(i18nSource, /detailTitle:\s*'Focus task'/);
  assert.match(i18nSource, /detailTitle:\s*'مهمة التركيز'/);
  assert.match(taskDetailSource, /title=\{t\('tasks\.detailTitle'\)\}/);
  assert.match(taskDetailSource, /categoryPill:\s*\{[\s\S]*borderCurve:\s*'continuous'/);
});

test('Secondary shared visual surfaces use continuous corners', () => {
  const metricCardSource = source('src/components/MetricCard.tsx');
  const tabletSidebarSource = source('src/components/TabletSidebarNavigation.tsx');
  const onboardingVisualSource = source('src/features/onboarding/OnboardingVisual.tsx');
  const tabLayoutSource = source('src/navigation/tab-layout-content.tsx');
  const statsSource = source('app/(tabs)/stats.tsx');
  const taskFormSource = source('src/features/focus/TaskForm.tsx');
  const focusTaskCardSource = source('src/features/focus/FocusTaskCard.tsx');
  const swipeableTaskRowSource = source('src/features/focus/SwipeableTaskRow.tsx');
  const tasksListSource = source('src/features/focus/TasksListScreen.tsx');

  assert.match(metricCardSource, /card:\s*\{[\s\S]*borderCurve:\s*'continuous'/);
  assert.match(tabletSidebarSource, /tabItem:\s*\{[\s\S]*borderCurve:\s*'continuous'/);
  assert.match(onboardingVisualSource, /sessionIcon:\s*\{[\s\S]*borderCurve:\s*'continuous'/);
  assert.match(tabLayoutSource, /tabBarItemStyle:\s*\{[\s\S]*borderCurve:\s*'continuous'/);
  assert.match(statsSource, /trendBadge:\s*\{[\s\S]*borderCurve:\s*'continuous'/);
  assert.match(taskFormSource, /input:\s*\{[\s\S]*borderCurve:\s*'continuous'/);
  assert.match(focusTaskCardSource, /iconWrap:\s*\{[\s\S]*borderCurve:\s*'continuous'/);
  assert.match(swipeableTaskRowSource, /swipeContainer:\s*\{[\s\S]*borderCurve:\s*'continuous'/);
  assert.match(swipeableTaskRowSource, /removeAction:\s*\{[\s\S]*borderCurve:\s*'continuous'/);
  assert.match(tasksListSource, /undoBar:\s*\{[\s\S]*borderCurve:\s*'continuous'/);
});
