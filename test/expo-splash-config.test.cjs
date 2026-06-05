const test = require('node:test');
const assert = require('node:assert/strict');

const appConfig = require('../app.json');
const packageJson = require('../package.json');

function getPluginConfig(pluginName) {
  return appConfig.expo.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === pluginName);
}

test('Expo splash screen owns startup branding', () => {
  const splashPlugin = getPluginConfig('expo-splash-screen');

  assert.ok(packageJson.dependencies['expo-splash-screen']);
  assert.equal(packageJson.dependencies['react-native-bootsplash'], undefined);
  assert.ok(splashPlugin);
  assert.equal(splashPlugin[1].image, './assets/images/icon.png');
  assert.equal(splashPlugin[1].imageWidth, 200);
  assert.equal(splashPlugin[1].resizeMode, 'contain');
  assert.equal(splashPlugin[1].backgroundColor, '#FCF8F4');
  assert.equal(splashPlugin[1].dark.backgroundColor, '#FCF8F4');
});

test('Expo config declares device localization and RTL support', () => {
  const localizationPlugin = getPluginConfig('expo-localization');

  assert.ok(packageJson.dependencies['expo-localization']);
  assert.ok(packageJson.dependencies['i18n-js']);
  assert.ok(localizationPlugin);
  assert.deepEqual(localizationPlugin[1].supportedLocales.ios, ['en', 'ar']);
  assert.deepEqual(localizationPlugin[1].supportedLocales.android, ['en', 'ar']);
  assert.equal(appConfig.expo.extra.supportsRTL, true);
});

test('Expo font plugin embeds Poppins and Thmanyah Sans native font assets', () => {
  const fontPlugin = getPluginConfig('expo-font');
  const androidFamilies = fontPlugin[1].android.fonts.map((font) => font.fontFamily);
  const iosFonts = fontPlugin[1].ios.fonts;

  assert.ok(androidFamilies.includes('Poppins'));
  assert.ok(androidFamilies.includes('Thmanyah Sans'));
  assert.ok(
    iosFonts.includes('./assets/fonts/thmanyahsans/thmanyahsans-Regular.otf'),
    'Thmanyah Sans regular font is embedded for iOS'
  );
  assert.ok(
    iosFonts.includes('./assets/fonts/thmanyahsans/thmanyahsans-Bold.otf'),
    'Thmanyah Sans bold font is embedded for iOS'
  );
});
