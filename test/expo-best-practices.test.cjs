const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const source = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

function routeFiles(directory = path.join(root, 'app')) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const absolutePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return routeFiles(absolutePath);
      }

      return entry.isFile() && entry.name.endsWith('.tsx')
        ? [path.relative(root, absolutePath)]
        : [];
    })
    .sort();
}

function sourceFiles(directories = ['app', 'src']) {
  return directories
    .flatMap((directory) => sourceFilesIn(path.join(root, directory)))
    .sort();
}

function sourceFilesIn(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const absolutePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return sourceFilesIn(absolutePath);
      }

      return entry.isFile() && /\.[jt]sx?$/.test(entry.name)
        ? [path.relative(root, absolutePath)]
        : [];
    });
}

test('route files do not define reusable inline components', () => {
  for (const routeFile of routeFiles()) {
    const routeSource = source(routeFile);
    const localFunctions = [...routeSource.matchAll(/^(?!export default function )function ([A-Za-z0-9]+)/gm)]
      .map((match) => match[1]);

    assert.deepEqual(localFunctions, [], `${routeFile} defines ${localFunctions.join(', ')}`);
  }
});

test('UI surfaces use style pointerEvents instead of deprecated pointerEvents props', () => {
  for (const relativePath of sourceFiles()) {
    assert.doesNotMatch(source(relativePath), /\spointerEvents=/, relativePath);
  }

  assert.match(source('src/features/focus/TimerRing.tsx'), /pointerEvents:\s*'box-none'/);
  assert.match(source('src/features/focus/TimerRing.tsx'), /pointerEvents:\s*'none'/);
  assert.match(source('src/features/focus/FocusBarChart.tsx'), /pointerEvents:\s*'none'/);
});

test('Expo SDK 54 config does not keep redundant New Architecture flags', () => {
  const appConfig = JSON.parse(source('app.json'));

  assert.equal(appConfig.expo.newArchEnabled, undefined);
});

test('React 19 context usage uses use and direct Context components', () => {
  const localeProviderSource = source('src/i18n/LocaleProvider.tsx');

  assert.doesNotMatch(localeProviderSource, /\buseContext\b/);
  assert.doesNotMatch(localeProviderSource, /LocaleContext\.Provider/);
  assert.match(localeProviderSource, /import \{[\s\S]*\buse\b[\s\S]*\} from 'react'/);
  assert.match(localeProviderSource, /return <LocaleContext value=\{value\}>/);
});

test('root layout wraps app content in GestureHandlerRootView for native swipe rows', () => {
  const rootLayoutSource = source('app/_layout.tsx');

  assert.match(
    rootLayoutSource,
    /import \{ GestureHandlerRootView \} from 'react-native-gesture-handler'/
  );
  assert.match(rootLayoutSource, /<GestureHandlerRootView style=\{styles\.gestureRoot\}>/);
});

test('notification task routing uses current layout width instead of Dimensions API', () => {
  const rootLayoutSource = source('app/_layout.tsx');
  const taskDetailRouteSource = source('src/navigation/task-detail-route.ts');
  const notificationObserverSource = source('src/navigation/use-timer-notification-observer.ts');

  assert.match(rootLayoutSource, /import \{ StyleSheet, useWindowDimensions \} from 'react-native'/);
  assert.match(rootLayoutSource, /const \{ width \} = useWindowDimensions\(\);/);
  assert.match(rootLayoutSource, /useTimerNotificationObserver\(width\)/);
  assert.match(notificationObserverSource, /resolveNotificationHref\(url, width\)/);
  assert.doesNotMatch(rootLayoutSource, /currentLayoutWidth/);
  assert.doesNotMatch(taskDetailRouteSource, /Dimensions|get\('window'\)|Platform/);
  assert.doesNotMatch(taskDetailRouteSource, /currentLayoutWidth|isTabletDevice/);
});

test('layout profile stays width-driven without platform tablet branches', () => {
  const layoutProfileSource = source('src/hooks/use-layout-profile.ts');

  assert.match(layoutProfileSource, /import \{ useWindowDimensions \} from 'react-native'/);
  assert.match(layoutProfileSource, /isTablet: width >= COMPACT_MAX/);
  assert.doesNotMatch(layoutProfileSource, /Platform/);
});

test('UI platform branches use Expo OS constants instead of Platform.OS', () => {
  const platformSensitiveFiles = [
    'src/i18n/LocaleProvider.tsx',
    'src/components/AppText.tsx',
    'src/components/Screen.tsx',
    'src/features/focus/orientation.ts',
    'src/features/focus/notifications.ts',
  ];

  for (const relativePath of platformSensitiveFiles) {
    assert.doesNotMatch(source(relativePath), /Platform\.OS/, relativePath);
  }

  assert.match(source('src/i18n/LocaleProvider.tsx'), /process\.env\.EXPO_OS === 'web'/);
  assert.match(source('src/features/focus/notifications.ts'), /process\.env\.EXPO_OS !== 'android'/);
  assert.match(source('src/features/focus/orientation.ts'), /process\.env\.EXPO_OS === 'ios'/);
});
