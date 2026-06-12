const fs = require('node:fs');
const path = require('node:path');

const files = [
  path.join(
    __dirname,
    '..',
    'node_modules',
    'expo-widgets',
    'plugin',
    'build',
    'ios',
    'xcode',
    'withTargetXcodeProject.js'
  ),
  path.join(
    __dirname,
    '..',
    'node_modules',
    'expo-widgets',
    'plugin',
    'src',
    'ios',
    'xcode',
    'withTargetXcodeProject.ts'
  ),
];

for (const filePath of files) {
  if (!fs.existsSync(filePath)) {
    continue;
  }

  const source = fs.readFileSync(filePath, 'utf8');
  const patched = source
    .replace("marketingVersion: '1.0',", "marketingVersion: config.ios?.version ?? config.version ?? '1.0',")
    .replace("currentProjectVersion: '1',", "currentProjectVersion: config.ios?.buildNumber ?? '1',");

  if (patched !== source) {
    fs.writeFileSync(filePath, patched);
  }
}
