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
  assert.doesNotMatch(themeSource, /\n  (title|heading|subheading|body|caption):\s*\d+,/);
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

test('AppText owns regular text font family so locale fonts stay centralized', () => {
  const files = [
    ...fs.readdirSync(path.join(root, 'app'), { recursive: true }),
    ...fs.readdirSync(path.join(root, 'src'), { recursive: true }),
  ]
    .filter((file) => typeof file === 'string' && /\.(tsx|ts)$/.test(file))
    .map((file) => (file.startsWith('src/') ? file : file.startsWith('app/') ? file : fs.existsSync(path.join(root, 'app', file)) ? `app/${file}` : `src/${file}`))
    .filter((file) => !file.includes('theme/index.ts'));

  const offenders = files.flatMap((file) => {
    const fileSource = source(file);
    const matches = [...fileSource.matchAll(/fontFamily:\s*typography\.family/g)];

    return matches.map((match) => `${file}: ${match[0]}`);
  });

  assert.deepEqual(offenders, []);
});

test('numeric display surfaces use tabular figures', () => {
  const sources = {
    metricCard: source('src/components/MetricCard.tsx'),
    controlRows: source('src/components/ControlRows.tsx'),
    timerRing: source('src/features/focus/TimerRing.tsx'),
    focusTaskCard: source('src/features/focus/FocusTaskCard.tsx'),
    focusBarChart: source('src/features/focus/FocusBarChart.tsx'),
    stats: source('app/(tabs)/stats.tsx'),
    distributionDonut: source('src/features/focus/DistributionDonut.tsx'),
    onboardingVisual: source('src/features/onboarding/OnboardingVisual.tsx'),
  };

  assert.match(sources.metricCard, /value:\s*\{[\s\S]*fontVariant:\s*\['tabular-nums'\]/);
  assert.match(sources.controlRows, /stepperNumber:\s*\{[\s\S]*fontVariant:\s*\['tabular-nums'\]/);
  assert.match(sources.timerRing, /time:\s*\{[\s\S]*fontVariant:\s*\['tabular-nums'\]/);
  assert.match(sources.focusTaskCard, /meta:\s*\{[\s\S]*fontVariant:\s*\['tabular-nums'\]/);
  assert.match(sources.focusBarChart, /tickLabel:\s*\{[\s\S]*fontVariant:\s*\['tabular-nums'\]/);
  assert.match(sources.focusBarChart, /axisLabel:\s*\{[\s\S]*fontVariant:\s*\['tabular-nums'\]/);
  assert.match(sources.stats, /focusValue:\s*\{[\s\S]*fontVariant:\s*\['tabular-nums'\]/);
  assert.match(sources.stats, /trendValue:\s*\{[\s\S]*fontVariant:\s*\['tabular-nums'\]/);
  assert.match(sources.distributionDonut, /legendValue:\s*\{[\s\S]*fontVariant:\s*\['tabular-nums'\]/);
  assert.match(sources.onboardingVisual, /timerPillText:\s*\{[\s\S]*fontVariant:\s*\['tabular-nums'\]/);
  assert.match(sources.onboardingVisual, /sessionValue:\s*\{[\s\S]*fontVariant:\s*\['tabular-nums'\]/);
  assert.match(sources.onboardingVisual, /trendText:\s*\{[\s\S]*fontVariant:\s*\['tabular-nums'\]/);
  assert.match(sources.onboardingVisual, /bigMetric:\s*\{[\s\S]*fontVariant:\s*\['tabular-nums'\]/);
});
