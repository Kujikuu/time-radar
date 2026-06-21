const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const onboardingSource = fs.readFileSync(path.join(__dirname, '../app/index.tsx'), 'utf8');
const homeSource = fs.readFileSync(path.join(__dirname, '../app/(tabs)/index.tsx'), 'utf8');
const brandLogoSource = fs.readFileSync(path.join(__dirname, '../src/components/BrandLogo.tsx'), 'utf8');

test('onboarding and home use the brand logo asset for the visible app identity', () => {
  assert.match(brandLogoSource, /timeradar-logo\.png/);
  assert.match(onboardingSource, /<BrandLogo\s+variant="hero"\s+\/>/);
  assert.match(homeSource, /<BrandLogo variant=\{showCompactHeader \? 'header' : 'hero'\}/);
  assert.doesNotMatch(onboardingSource, /title:\s*'TimeRadar'/);
  assert.doesNotMatch(homeSource, /<Text\s+style=\{styles\.appTitle\}>TimeRadar<\/Text>/);
});
