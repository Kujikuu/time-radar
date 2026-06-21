const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const source = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

test('primary screens gate content behind loading placeholders', () => {
  const homeSource = source('app/(tabs)/index.tsx');
  const tasksSource = source('src/features/focus/TasksListScreen.tsx');
  const statsSource = source('app/(tabs)/stats.tsx');
  const taskDetailSource = source('src/features/focus/TaskDetailContent.tsx');

  assert.match(homeSource, /loading: tasksLoading/);
  assert.match(homeSource, /loading: statsLoading/);
  assert.match(homeSource, /loading: settingsLoading/);
  assert.match(homeSource, /isLoading \?/);
  assert.match(homeSource, /<LoadingPlaceholder variant="home"/);

  assert.match(tasksSource, /loading, reload/);
  assert.match(tasksSource, /loading \?/);
  assert.match(tasksSource, /<LoadingPlaceholder variant="list"/);

  assert.match(statsSource, /loading, reload/);
  assert.match(statsSource, /loading \?/);
  assert.match(statsSource, /<LoadingPlaceholder variant="stats"/);

  assert.match(taskDetailSource, /loading, save/);
  assert.match(taskDetailSource, /if \(loading\)/);
  assert.match(taskDetailSource, /<LoadingPlaceholder variant="detail"/);
});

test('LoadingPlaceholder announces loading state to assistive technology', () => {
  const loadingSource = source('src/components/LoadingPlaceholder.tsx');

  assert.match(loadingSource, /accessibilityLabel=\{t\('common\.loading'\)\}/);
  assert.match(loadingSource, /accessibilityLiveRegion="polite"/);
  assert.match(loadingSource, /accessibilityRole="progressbar"/);
});

test('stats trend badge branches on positive, negative, and neutral values', () => {
  const statsSource = source('app/(tabs)/stats.tsx');
  const trendSource = source('src/features/focus/trend-visual.ts');

  assert.match(statsSource, /trendVisualForPercent/);
  assert.match(statsSource, /trendAccessibilityLabel/);
  assert.match(trendSource, /IconTrendingUp/);
  assert.match(trendSource, /IconTrendingDown/);
  assert.match(trendSource, /IconMinus/);
});

test('stats hides charts and shows empty copy when there is no focus data', () => {
  const statsSource = source('app/(tabs)/stats.tsx');

  assert.match(statsSource, /hasFocusData = summary\.focusMinutes > 0/);
  assert.match(statsSource, /t\('stats\.emptyTitle'\)/);
  assert.match(statsSource, /t\('stats\.emptyBody'\)/);
});

test('stats links to settings for supporter purchase instead of duplicating the card', () => {
  const statsSource = source('app/(tabs)/stats.tsx');

  assert.match(statsSource, /t\('stats\.supportLink'\)/);
  assert.match(statsSource, /router\.push\('\/\(tabs\)\/settings'/);
  assert.doesNotMatch(statsSource, /support\.purchaseAction/);
});

test('FocusTaskCard play action starts the session and returns home', () => {
  const focusTaskCardSource = source('src/features/focus/FocusTaskCard.tsx');

  assert.match(focusTaskCardSource, /useFocusTimer\(\)/);
  assert.match(focusTaskCardSource, /await start\(task\.id\)/);
  assert.match(focusTaskCardSource, /router\.replace\('\/\(tabs\)'/);
});

test('TaskForm hides advanced break settings until expanded', () => {
  const taskFormSource = source('src/features/focus/TaskForm.tsx');

  assert.match(taskFormSource, /showAdvanced/);
  assert.match(taskFormSource, /t\('taskForm\.showAdvanced'\)/);
  assert.match(taskFormSource, /t\('taskForm\.hideAdvanced'\)/);
});

test('home prioritizes the timer above the radar on phone layouts', () => {
  const homeSource = source('app/(tabs)/index.tsx');

  const phoneBlock = homeSource.match(/isWide \? \([\s\S]*?\) : \(\s*<>[\s\S]*?<\/>\s*\)/);

  assert.ok(phoneBlock, 'phone layout block should exist');
  assert.ok(
    phoneBlock[0].indexOf('renderTimerCard()') < phoneBlock[0].indexOf('renderRadarCard(true)'),
    'timer card should render before compact radar card on phone'
  );
});

test('home shows phase completion feedback in the foreground', () => {
  const homeSource = source('app/(tabs)/index.tsx');

  assert.match(homeSource, /lastCompletion/);
  assert.match(homeSource, /<PhaseCompletionToast/);
  assert.match(homeSource, /clearLastCompletion/);
});

test('tasks and stats screens support pull-to-refresh', () => {
  const tasksSource = source('src/features/focus/TasksListScreen.tsx');
  const statsSource = source('app/(tabs)/stats.tsx');
  const screenSource = source('src/components/Screen.tsx');

  assert.match(screenSource, /RefreshControl/);
  assert.match(tasksSource, /onRefresh=\{handleRefresh\}/);
  assert.match(statsSource, /onRefresh=\{handleRefresh\}/);
});
