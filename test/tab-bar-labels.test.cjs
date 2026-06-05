const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const tabsLayoutSource = fs.readFileSync(path.join(__dirname, '../app/(tabs)/_layout.tsx'), 'utf8');

test('bottom tab bar renders icon-only items', () => {
  assert.match(tabsLayoutSource, /tabBarShowLabel:\s*false/);
  assert.doesNotMatch(tabsLayoutSource, /tabBarLabelStyle:/);
});
