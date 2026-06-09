const test = require('node:test');
const assert = require('node:assert/strict');

const tabRules = require('../.test-build/navigation/tab-rules.js');

test('bottom tab route order mirrors for RTL while keeping route names stable', () => {
  assert.deepEqual(tabRules.bottomTabRouteOrder('ltr'), ['index', 'tasks', 'stats', 'settings']);
  assert.deepEqual(tabRules.bottomTabRouteOrder('rtl'), ['settings', 'stats', 'tasks', 'index']);
});

test('sidebar tab route order stays top-to-bottom regardless of reading direction', () => {
  assert.deepEqual(tabRules.sidebarTabRouteOrder(), ['index', 'tasks', 'stats', 'settings']);
});
