const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const tabsLayoutSource = fs.readFileSync(path.join(__dirname, '../app/(tabs)/_layout.tsx'), 'utf8');

test('bottom tab bar renders icon-only items', () => {
  assert.match(tabsLayoutSource, /tabBarShowLabel:\s*false/);
  assert.doesNotMatch(tabsLayoutSource, /tabBarLabelStyle:/);
});

test('bottom tab bar is fixed to the mobile bottom edge without extra safe-area growth', () => {
  assert.match(tabsLayoutSource, /safeAreaInsets=\{\{\s*bottom:\s*0,\s*\}\}/s);
  assert.match(tabsLayoutSource, /height:\s*78/);
  assert.match(tabsLayoutSource, /position:\s*'absolute'/);
  assert.match(tabsLayoutSource, /left:\s*0/);
  assert.match(tabsLayoutSource, /right:\s*0/);
  assert.match(tabsLayoutSource, /bottom:\s*0/);
  assert.doesNotMatch(tabsLayoutSource, /marginBottom:/);
  assert.doesNotMatch(tabsLayoutSource, /marginTop:/);
  assert.match(tabsLayoutSource, /paddingTop:\s*10/);
});

test('bottom tab bar keeps the approved rounded connected shape', () => {
  assert.match(tabsLayoutSource, /borderTopLeftRadius:\s*radius\.lg/);
  assert.match(tabsLayoutSource, /borderTopRightRadius:\s*radius\.lg/);
  assert.match(tabsLayoutSource, /overflow:\s*'hidden'/);
});

test('home restores the shared tab bar style after fullscreen timer closes', () => {
  const homeSource = fs.readFileSync(path.join(__dirname, '../app/(tabs)/index.tsx'), 'utf8');

  assert.match(tabsLayoutSource, /export const bottomTabBarStyle/);
  assert.match(homeSource, /import \{ bottomTabBarStyle \} from '\.\/_layout'/);
  assert.match(
    homeSource,
    /tabBarStyle:\s*isImmersiveTimerVisible \? styles\.hiddenTabBar : bottomTabBarStyle/
  );
  assert.doesNotMatch(homeSource, /tabBarStyle:\s*isImmersiveTimerVisible \? styles\.hiddenTabBar : undefined/);
});
