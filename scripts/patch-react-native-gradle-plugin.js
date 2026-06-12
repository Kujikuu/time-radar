const fs = require('node:fs');
const path = require('node:path');

const settingsPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-native',
  'gradle-plugin',
  'settings.gradle.kts'
);

if (!fs.existsSync(settingsPath)) {
  process.exit(0);
}

const source = fs.readFileSync(settingsPath, 'utf8');
const patched = source.replace(
  'id("org.gradle.toolchains.foojay-resolver-convention").version("0.5.0")',
  'id("org.gradle.toolchains.foojay-resolver-convention").version("1.0.0")'
);

if (patched !== source) {
  fs.writeFileSync(settingsPath, patched);
}
