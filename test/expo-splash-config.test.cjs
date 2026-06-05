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
