const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const tabsLayoutSource = fs.readFileSync(
  path.join(__dirname, '../src/navigation/tab-layout-content.tsx'),
  'utf8'
);

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
  assert.match(
    homeSource,
    /import \{ bottomTabBarStyle \} from '@\/src\/navigation\/tab-layout-content'/
  );
  assert.match(
    homeSource,
    /isImmersiveTimerVisible[\s\S]*tabBarStyle:\s*styles\.hiddenTabBar[\s\S]*bottomTabBarStyle/s
  );
  assert.match(homeSource, /!isWide/);
});

test('fullscreen timer hides tablet sidebar navigation as app chrome', () => {
  const homeSource = fs.readFileSync(path.join(__dirname, '../app/(tabs)/index.tsx'), 'utf8');

  assert.match(tabsLayoutSource, /NavigationChromeProvider/);
  assert.match(tabsLayoutSource, /useNavigationChromeVisibility\(\)/);
  assert.match(tabsLayoutSource, /isWide && !isNavigationChromeHidden/);
  assert.match(homeSource, /useSetNavigationChromeHidden\(\)/);
  assert.match(homeSource, /setNavigationChromeHidden\(isImmersiveTimerVisible\)/);
});
