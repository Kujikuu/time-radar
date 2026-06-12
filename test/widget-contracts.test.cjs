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

test('expo doctor allows the intentional widget dependency metadata gaps', () => {
  const pkg = json('package.json');
  assert.deepEqual(pkg.expo?.doctor?.reactNativeDirectoryCheck?.exclude, [
    'expo-modules-jsi',
  ]);
});

test('widget native modules are autolinked only on their supported platforms', () => {
  const pkg = json('package.json');

  assert.equal(pkg.dependencies?.['@bittingz/expo-widgets'], undefined);
  assert.equal(pkg.expo?.autolinking?.ios, undefined);
  assert.deepEqual(pkg.expo?.autolinking?.android?.exclude, ['expo-widgets']);
});

test('android widget uses an app-local bridge instead of @bittingz/expo-widgets', () => {
  const app = json('app.json');
  const plugins = app.expo.plugins;
  const pluginSource = read('plugins/with-timer-radar-android-widget.js');
  const moduleSource = read('widgets-android/src/main/java/package_name/TimerRadarWidgetModule.kt');
  const packageSource = read('widgets-android/src/main/java/package_name/TimerRadarWidgetPackage.kt');

  assert.equal(plugins.some((entry) => Array.isArray(entry) && entry[0] === '@bittingz/expo-widgets'), false);
  assert.ok(plugins.includes('./plugins/with-timer-radar-android-widget'));
  assert.match(pluginSource, /add\(TimerRadarWidgetPackage\(\)\)/);
  assert.match(pluginSource, /WIDGET_RECEIVER_NAME = '\.TimerRadarWidgetProvider'/);
  assert.match(moduleSource, /getName\(\): String = "TimerRadarWidget"/);
  assert.match(moduleSource, /getSharedPreferences\("\$targetPackageName\.widgetdata"/);
  assert.match(moduleSource, /AppWidgetManager\.ACTION_APPWIDGET_UPDATE/);
  assert.match(packageSource, /TimerRadarWidgetModule\(reactContext\)/);
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

test('widget sync writes iOS data and Android package-scoped data', () => {
  const source = read('src/widgets/widget-sync.ts');
  const rootLayoutSource = read('app/_layout.tsx');

  assert.match(source, /FocusTimerWidget\.updateSnapshot/);
  assert.match(source, /import\('\.\/focus-timer-widget'\)/);
  assert.match(source, /NativeModules\.TimerRadarWidget/);
  assert.match(source, /ANDROID_WIDGET_PACKAGE = 'com\.afifistudio\.timeradar'/);
  assert.match(source, /widgetModule\.setWidgetData\(serialized, packageName\)/);
  assert.match(source, /Platform\.OS === 'ios'/);
  assert.match(source, /Platform\.OS === 'android'/);
  assert.match(rootLayoutSource, /import \{ clearWidgetData \} from '@\/src\/widgets\/widget-sync'/);
  assert.match(rootLayoutSource, /void clearWidgetData\(\)/);
});

test('iOS widget layout is created with official expo-widgets', () => {
  const source = read('src/widgets/focus-timer-widget.tsx');

  assert.match(source, /createWidget<TimerWidgetData>\('FocusTimerWidget'/);
  assert.match(source, /'widget'/);
  assert.match(source, /@expo\/ui\/swift-ui/);
  assert.match(source, /@expo\/ui\/swift-ui\/modifiers/);
  assert.doesNotMatch(source, /WidgetKit/);
});

test('iOS widget tolerates placeholder props before the app writes timer data', () => {
  const source = read('src/widgets/focus-timer-widget.tsx');

  assert.match(source, /resolveTimerWidgetData\(props: Partial<TimerWidgetData> \| null \| undefined\)/);
  assert.match(source, /typeof props\?\.updatedAt === 'string'/);
  assert.match(source, /EMPTY_TIMER_WIDGET_DATA/);
  assert.doesNotMatch(source, /props\.updatedAt\.length/);
  assert.match(source, /background\('#FCF8F4'\)/);
  assert.match(source, /containerBackground\('#FCF8F4', 'widget'\)/);
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
