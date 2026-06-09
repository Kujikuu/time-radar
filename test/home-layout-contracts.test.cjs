const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const source = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('wide home uses effective row direction so Arabic mirrors the content columns once', () => {
  const homeSource = source('app/(tabs)/index.tsx');

  assert.match(
    homeSource,
    /const splitRowDirection = \{\s*flexDirection: rowDirectionForTextDirection\(direction, nativeDirection\),\s*\}/
  );
  assert.match(homeSource, /<View style=\{\[styles\.splitRow, splitRowDirection\]\}>/);
  assert.match(
    homeSource,
    /\{renderTimerColumn\(\)\}[\s\S]*\{renderProgressColumn\(\)\}/
  );
  assert.doesNotMatch(homeSource, /direction === 'rtl'\s*\?/);
});
