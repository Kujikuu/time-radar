const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const source = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

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
