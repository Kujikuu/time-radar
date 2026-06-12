const fs = require('node:fs');
const path = require('node:path');

const sourcesPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-jsi',
  'apple',
  'Sources',
  'ExpoModulesJSI'
);

if (!fs.existsSync(sourcesPath)) {
  process.exit(0);
}

function getSwiftFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return getSwiftFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith('.swift') ? [entryPath] : [];
  });
}

for (const filePath of getSwiftFiles(sourcesPath)) {
  const source = fs.readFileSync(filePath, 'utf8');
  const patched = source
    .replace(/\bweak let(\s+runtime\s*:)/g, 'weak var$1')
    .replace(
      'internal final class HostFunctionContext: Sendable',
      'internal final class HostFunctionContext: @unchecked Sendable'
    )
    .replace(
      'internal final class HostObjectContext: Sendable',
      'internal final class HostObjectContext: @unchecked Sendable'
    )
    .replace(
      'public final class JavaScriptPropNameID: JavaScriptType {',
      'public final class JavaScriptPropNameID: JavaScriptType, @unchecked Sendable {'
    )
    .replace(
      'public final class JavaScriptValue: JavaScriptType, Equatable, Escapable, Error {',
      'public final class JavaScriptValue: JavaScriptType, Equatable, Escapable, Error, @unchecked Sendable {'
    );

  if (patched !== source) {
    fs.writeFileSync(filePath, patched);
  }
}
