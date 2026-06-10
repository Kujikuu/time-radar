const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const source = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
const normalizedSource = (relativePath) => source(relativePath).replace(/\s+/g, ' ');

test('supporter product constants define the one-time $1.99 supporter pack', () => {
  const constants = require('../.test-build/features/support/constants.js');

  assert.equal(constants.SUPPORTER_PRODUCT_ID, 'supporter_pack_199');
  assert.equal(constants.SUPPORTER_PRODUCT_TYPE, 'in-app');
  assert.equal(constants.SUPPORTER_PRICE_LABEL, '$1.99');
});

test('web supporter purchase service is safely unsupported', async () => {
  const purchase = require('../.test-build/features/support/purchase.web.js');
  const status = await purchase.loadSupporterProduct();
  const buyResult = await purchase.buySupporterPack();
  const restoreResult = await purchase.restoreSupporterPack();

  assert.equal(status.supported, false);
  assert.equal(status.purchased, false);
  assert.equal(status.productId, 'supporter_pack_199');
  assert.equal(status.priceLabel, '$1.99');
  assert.equal(status.messageKey, 'support.unavailable');
  assert.deepEqual(buyResult, { purchased: false, messageKey: 'support.unavailable' });
  assert.deepEqual(restoreResult, { purchased: false, messageKey: 'support.unavailable' });
});

test('supporter settings migration defaults to unpurchased and disabled theme', () => {
  const databaseSource = source('src/features/focus/database.ts');
  const repositorySource = source('src/features/focus/repository.ts');
  const typesSource = source('src/features/focus/types.ts');

  assert.match(databaseSource, /const DATABASE_VERSION = 6;/);
  assert.match(databaseSource, /supporter_purchased:\s*'false'/);
  assert.match(databaseSource, /supporter_theme_enabled:\s*'false'/);
  assert.match(repositorySource, /supporterPurchased:\s*false/);
  assert.match(repositorySource, /supporterThemeEnabled:\s*false/);
  assert.match(repositorySource, /settings\.get\('supporter_purchased'\) === 'true'/);
  assert.match(repositorySource, /settings\.get\('supporter_theme_enabled'\) === 'true'/);
  assert.match(repositorySource, /\['supporter_purchased', String\(values\.supporterPurchased\)\]/);
  assert.match(repositorySource, /\['supporter_theme_enabled', String\(values\.supporterThemeEnabled\)\]/);
  assert.match(typesSource, /supporterPurchased: boolean;/);
  assert.match(typesSource, /supporterThemeEnabled: boolean;/);
});

test('settings and stats expose the supporter purchase and theme surfaces', () => {
  const settingsSource = source('app/(tabs)/settings.tsx');
  const statsSource = source('app/(tabs)/stats.tsx');

  assert.match(settingsSource, /support\.title/);
  assert.match(settingsSource, /support\.restore/);
  assert.match(settingsSource, /supporterThemeEnabled/);
  assert.match(statsSource, /support\.purchaseAction/);
  assert.match(statsSource, /support\.freeForever/);
  assert.doesNotMatch(`${settingsSource}\n${statsSource}`, /TimeRadar Pro|pro\./);
});

test('supporter restore actions share disabled state and selectable status copy', () => {
  const settingsSource = source('app/(tabs)/settings.tsx');
  const statsSource = source('app/(tabs)/stats.tsx');

  for (const routeSource of [settingsSource, statsSource]) {
    assert.match(routeSource, /const supportActionsDisabled = supporterPurchase\.status\.loading;/);
    assert.match(routeSource, /disabled=\{supportActionsDisabled\}/);
    assert.match(routeSource, /accessibilityState=\{\{ disabled: supportActionsDisabled \}\}/);
    assert.match(routeSource, /pressed && !supportActionsDisabled && styles\.pressed/);
    assert.match(routeSource, /<AppText selectable style=\{\[styles\.supportStatus/);
    assert.match(routeSource, /restoreButtonDisabled:\s*\{[\s\S]*opacity:\s*0\.5/);
  }
});

test('native supporter purchase uses Apple and Google store requests', () => {
  const nativePurchaseSource = source('src/features/support/purchase.ts');

  assert.match(nativePurchaseSource, /fetchProducts\(\{\s*skus:\s*\[SUPPORTER_PRODUCT_ID\],\s*type:\s*SUPPORTER_PRODUCT_TYPE\s*\}\)/);
  assert.match(nativePurchaseSource, /finishTransaction\(\{\s*purchase,\s*isConsumable:\s*false\s*\}\)/);
  assert.match(nativePurchaseSource, /apple:\s*\{\s*sku:\s*SUPPORTER_PRODUCT_ID\s*\}/);
  assert.match(nativePurchaseSource, /google:\s*\{\s*skus:\s*\[SUPPORTER_PRODUCT_ID\]\s*\}/);
  assert.match(nativePurchaseSource, /restorePurchases\(\)/);
  assert.match(nativePurchaseSource, /getAvailablePurchases\(\)/);
});

test('supporter purchase docs describe native iOS and Android stores without web checkout', () => {
  const privacyPolicy = source('docs/app-store/privacy-policy.md');
  const privacySite = normalizedSource('docs/app-store/site/privacy.html');
  const submissionKit = source('docs/app-store/submission-kit.md');
  const iapProduct = source('docs/app-store/iap-product.md');
  const webPurchaseSource = source('src/features/support/purchase.web.ts');

  for (const documentSource of [privacyPolicy, privacySite, submissionKit]) {
    assert.match(documentSource, /Apple In-App Purchase or Google Play Billing/);
  }

  assert.match(iapProduct, /Google Play Console Setup/);
  assert.match(iapProduct, /one-time product/);
  assert.match(iapProduct, /supporter_pack_199/);
  assert.doesNotMatch(
    `${privacyPolicy}\n${privacySite}\n${submissionKit}`,
    /processed (only )?by Apple In-App Purchase\.|Apple processes the payment|Apple's in-app purchase system/
  );
  assert.match(webPurchaseSource, /support\.unavailable/);
});

test('settings notification and supporter actions stay compact on narrow screens', () => {
  const settingsSource = source('app/(tabs)/settings.tsx');

  for (const styleName of ['permissionButton', 'systemSettingsButton', 'supportButton']) {
    const styleBody = settingsSource.match(new RegExp(`${styleName}:\\s*\\{([\\s\\S]*?)\\n  \\},`))?.[1] ?? '';

    assert.match(styleBody, /alignSelf:\s*'flex-start'/, `${styleName} should not stretch across the row`);
    assert.match(styleBody, /maxWidth:\s*'50%'/, `${styleName} should cap row width`);
  }

  assert.match(settingsSource, /supportPanel:\s*\{[\s\S]*alignItems:\s*'flex-start'/);
  assert.match(settingsSource, /permissionPanel:\s*\{[\s\S]*alignItems:\s*'flex-start'/);
});
