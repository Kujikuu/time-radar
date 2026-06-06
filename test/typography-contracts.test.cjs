const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const source = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('theme exposes role-based typography constants', () => {
  const themeSource = source('src/theme/index.ts');

  assert.match(themeSource, /size:\s*\{/);
  assert.match(themeSource, /lineHeight:\s*\{/);
  assert.match(themeSource, /weight:\s*\{/);
});

test('app typography uses theme constants instead of raw style numbers', () => {
  const files = [
    ...fs.readdirSync(path.join(root, 'app'), { recursive: true }),
    ...fs.readdirSync(path.join(root, 'src'), { recursive: true }),
  ]
    .filter((file) => typeof file === 'string' && /\.(tsx|ts)$/.test(file))
    .map((file) => (file.startsWith('src/') ? file : file.startsWith('app/') ? file : fs.existsSync(path.join(root, 'app', file)) ? `app/${file}` : `src/${file}`))
    .filter((file) => !file.includes('theme/index.ts'));

  const offenders = files.flatMap((file) => {
    const fileSource = source(file);
    const matches = [
      ...fileSource.matchAll(/fontSize:\s*\d+/g),
      ...fileSource.matchAll(/lineHeight:\s*\d+/g),
      ...fileSource.matchAll(/fontWeight:\s*['"][0-9a-zA-Z]+['"]/g),
      ...fileSource.matchAll(/fontSize=\{?["']?\d+/g),
    ];

    return matches.map((match) => `${file}: ${match[0]}`);
  });

  assert.deepEqual(offenders, []);
});
