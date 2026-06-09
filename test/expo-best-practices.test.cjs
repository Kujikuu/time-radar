const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const source = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('route files do not define reusable inline components', () => {
  const routeFiles = [
    'app/_layout.tsx',
    'app/index.tsx',
    'app/(tabs)/settings.tsx',
  ];

  for (const routeFile of routeFiles) {
    const routeSource = source(routeFile);
    const localComponents = [...routeSource.matchAll(/^function ([A-Z][A-Za-z0-9]+)/gm)]
      .map((match) => match[1])
      .filter((name) => !name.endsWith('Screen') && name !== 'RootLayout');

    assert.deepEqual(localComponents, [], `${routeFile} defines ${localComponents.join(', ')}`);
  }
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
