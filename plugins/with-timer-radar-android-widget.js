const { AndroidConfig, withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const WIDGET_RECEIVER_NAME = '.TimerRadarWidgetProvider';
const WIDGET_PROVIDER_RESOURCE = '@xml/timer_radar_widget_info';

function copyDirectoryWithPackageTransform(sourceDirectory, destinationDirectory, packageName) {
  fs.mkdirSync(destinationDirectory, { recursive: true });

  for (const entry of fs.readdirSync(sourceDirectory, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDirectory, entry.name);
    const destinationPath = path.join(destinationDirectory, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryWithPackageTransform(sourcePath, destinationPath, packageName);
      continue;
    }

    const contents = fs.readFileSync(sourcePath, 'utf8');
    const transformedContents = entry.name.endsWith('.kt')
      ? contents.replace(/\bpackage_name\b/g, packageName)
      : contents;

    fs.writeFileSync(destinationPath, transformedContents);
  }
}

function copyDirectory(sourceDirectory, destinationDirectory) {
  fs.mkdirSync(destinationDirectory, { recursive: true });

  for (const entry of fs.readdirSync(sourceDirectory, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDirectory, entry.name);
    const destinationPath = path.join(destinationDirectory, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

function patchMainApplication(mainApplicationPath) {
  if (!fs.existsSync(mainApplicationPath)) {
    return;
  }

  const source = fs.readFileSync(mainApplicationPath, 'utf8');
  if (source.includes('TimerRadarWidgetPackage()')) {
    return;
  }

  const patched = source.replace(
    /PackageList\(this\)\.packages\.apply \{\n/,
    'PackageList(this).packages.apply {\n          add(TimerRadarWidgetPackage())\n'
  );

  fs.writeFileSync(mainApplicationPath, patched);
}

function withTimerRadarAndroidWidget(config) {
  config = withAndroidManifest(config, (nextConfig) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(nextConfig.modResults);
    const receivers = mainApplication.receiver ?? [];

    mainApplication.receiver = [
      ...receivers.filter((receiver) => receiver.$?.['android:name'] !== WIDGET_RECEIVER_NAME),
      {
        $: {
          'android:name': WIDGET_RECEIVER_NAME,
          'android:exported': 'false',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'android.appwidget.action.APPWIDGET_UPDATE',
                },
              },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': WIDGET_PROVIDER_RESOURCE,
            },
          },
        ],
      },
    ];

    return nextConfig;
  });

  return withDangerousMod(config, [
    'android',
    async (nextConfig) => {
      const packageName = AndroidConfig.Package.getPackage(nextConfig);
      if (!packageName) {
        throw new Error('android.package is required for the Time Radar Android widget.');
      }

      const projectRoot = nextConfig.modRequest.projectRoot;
      const androidRoot = nextConfig.modRequest.platformProjectRoot;
      const packagePath = packageName.replace(/\./g, '/');

      copyDirectoryWithPackageTransform(
        path.join(projectRoot, 'widgets-android/src/main/java/package_name'),
        path.join(androidRoot, 'app/src/main/java', packagePath),
        packageName
      );
      copyDirectory(
        path.join(projectRoot, 'widgets-android/src/res'),
        path.join(androidRoot, 'app/src/main/res')
      );
      patchMainApplication(path.join(androidRoot, 'app/src/main/java', packagePath, 'MainApplication.kt'));

      return nextConfig;
    },
  ]);
}

module.exports = withTimerRadarAndroidWidget;
