const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function json(relativePath) {
  return JSON.parse(read(relativePath));
}

function widgetPluginOptions() {
  const app = json('app.json');
  const plugin = app.expo.plugins.find((entry) => Array.isArray(entry) && entry[0] === '@bittingz/expo-widgets');
  assert.ok(plugin, 'app.json should configure @bittingz/expo-widgets');
  return plugin[1];
}

test('expo doctor allows the intentional widget dependency metadata gaps', () => {
  const pkg = json('package.json');
  assert.deepEqual(pkg.expo?.doctor?.reactNativeDirectoryCheck?.exclude, [
    '@bittingz/expo-widgets',
    'expo-modules-jsi',
  ]);
});

test('widget native modules are autolinked only on their supported platforms', () => {
  const pkg = json('package.json');

  assert.deepEqual(pkg.expo?.autolinking?.ios?.exclude, ['@bittingz/expo-widgets']);
  assert.deepEqual(pkg.expo?.autolinking?.android?.exclude, ['expo-widgets']);
});

test('official expo-widgets config owns the iOS widget target', () => {
  const app = json('app.json');
  const plugin = app.expo.plugins.find((entry) => Array.isArray(entry) && entry[0] === 'expo-widgets');
  assert.ok(plugin, 'app.json should configure official expo-widgets');

  assert.equal(plugin[1].bundleIdentifier, 'com.afifistudio.timeradar.widgets');
  assert.equal(plugin[1].groupIdentifier, 'group.com.afifistudio.timeradar');
  assert.deepEqual(plugin[1].widgets, [
    {
      name: 'FocusTimerWidget',
      displayName: 'Time Radar',
      description: 'Shows your active focus timer.',
      supportedFamilies: ['systemSmall', 'systemMedium'],
      contentMarginsDisabled: true,
      ios: {
        supportedFamilies: ['systemSmall', 'systemMedium'],
        contentMarginsDisabled: true,
      },
      android: null,
    },
  ]);
});

test('android widget plugin config is limited to android widget sources', () => {
  const options = widgetPluginOptions();

  assert.equal(options.ios, undefined);
  assert.equal(options.android.src, './widgets-android');
  assert.deepEqual(options.android.widgets, [
    {
      name: 'TimerRadarWidgetProvider',
      resourceName: '@xml/timer_radar_widget_info',
    },
  ]);
});

test('widget sync writes iOS data and Android package-scoped data', () => {
  const source = read('src/widgets/widget-sync.ts');

  assert.match(source, /FocusTimerWidget\.updateSnapshot/);
  assert.match(source, /import\('\.\/focus-timer-widget'\)/);
  assert.match(source, /import\('@bittingz\/expo-widgets'\)/);
  assert.match(source, /ANDROID_WIDGET_PACKAGE = 'com\.afifistudio\.timeradar'/);
  assert.match(source, /fn\(serialized, packageName\)/);
  assert.match(source, /Platform\.OS === 'ios'/);
  assert.match(source, /Platform\.OS === 'android'/);
});

test('iOS widget layout is created with official expo-widgets', () => {
  const source = read('src/widgets/focus-timer-widget.tsx');

  assert.match(source, /createWidget<TimerWidgetData>\('FocusTimerWidget'/);
  assert.match(source, /'widget'/);
  assert.match(source, /@expo\/ui\/swift-ui/);
  assert.match(source, /@expo\/ui\/swift-ui\/modifiers/);
  assert.doesNotMatch(source, /WidgetKit/);
});

test('Android widget source reads the package-scoped widget data preference', () => {
  const providerPath = path.join(
    root,
    'widgets-android/src/main/java/package_name/TimerRadarWidgetProvider.kt'
  );
  const layoutPath = path.join(root, 'widgets-android/src/res/layout/timer_radar_widget.xml');
  const infoPath = path.join(root, 'widgets-android/src/res/xml/timer_radar_widget_info.xml');

  assert.ok(fs.existsSync(providerPath), 'Android widget provider should exist');
  assert.ok(fs.existsSync(layoutPath), 'Android widget layout should exist');
  assert.ok(fs.existsSync(infoPath), 'Android widget provider metadata should exist');

  const source = fs.readFileSync(providerPath, 'utf8');
  assert.match(source, /AppWidgetProvider/);
  assert.match(source, /context\.packageName \+ "\.widgetdata"/);
  assert.match(source, /getString\("widgetdata", null\)/);
  assert.match(source, /JSONObject/);
});
