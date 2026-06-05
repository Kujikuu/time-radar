const test = require('node:test');
const assert = require('node:assert/strict');

const i18n = require('../.test-build/i18n/index.js');

test('resolveAppLocale uses Arabic for Arabic device locales and English fallback otherwise', () => {
  assert.equal(
    i18n.resolveAppLocale([{ languageCode: 'ar', languageTag: 'ar-SA', textDirection: 'rtl' }]),
    'ar'
  );
  assert.equal(
    i18n.resolveAppLocale([{ languageCode: null, languageTag: 'ar-EG', textDirection: 'rtl' }]),
    'ar'
  );
  assert.equal(
    i18n.resolveAppLocale([{ languageCode: 'fr', languageTag: 'fr-FR', textDirection: 'ltr' }]),
    'en'
  );
  assert.equal(i18n.resolveAppLocale([]), 'en');
});

test('resolveAppLocale honors explicit language preference before device locale', () => {
  const arabicDevice = [{ languageCode: 'ar', languageTag: 'ar-SA', textDirection: 'rtl' }];
  const englishDevice = [{ languageCode: 'en', languageTag: 'en-US', textDirection: 'ltr' }];

  assert.equal(i18n.resolveAppLocale(arabicDevice, 'en'), 'en');
  assert.equal(i18n.resolveAppLocale(englishDevice, 'ar'), 'ar');
  assert.equal(i18n.resolveAppLocale(arabicDevice, 'system'), 'ar');
});

test('locale helpers select RTL direction and Thmanyah Sans only for Arabic', () => {
  assert.equal(i18n.textDirectionForLocale('ar'), 'rtl');
  assert.equal(i18n.textDirectionForLocale('en'), 'ltr');
  assert.equal(i18n.fontFamilyForLocale('ar'), 'Thmanyah Sans');
  assert.equal(i18n.fontFamilyForLocale('en'), 'Poppins');
});

test('text alignment follows the active reading direction', () => {
  assert.equal(i18n.textAlignForTextDirection('ltr'), 'left');
  assert.equal(i18n.textAlignForTextDirection('rtl'), 'right');
});

test('translated enum options keep stable stored values', () => {
  assert.deepEqual(i18n.focusCategoryOptions('ar'), [
    { value: 'Work', label: 'عمل' },
    { value: 'Study', label: 'دراسة' },
    { value: 'Personal', label: 'شخصي' },
  ]);

  assert.deepEqual(i18n.statsRangeOptions('ar'), [
    { value: 'Day', label: 'اليوم' },
    { value: 'Week', label: 'الأسبوع' },
    { value: 'Month', label: 'الشهر' },
    { value: 'Year', label: 'السنة' },
  ]);
});

test('language toggle switches directly between English and Arabic', () => {
  assert.equal(i18n.languageTogglePreferenceForLocale('en'), 'ar');
  assert.equal(i18n.languageTogglePreferenceForLocale('ar'), 'en');
  assert.equal(i18n.translate('en', 'settings.switchToArabic'), 'Switch to Arabic');
  assert.equal(i18n.translate('ar', 'settings.switchToEnglish'), 'التبديل إلى الإنجليزية');
});

test('Arabic falls back to English for missing translation keys', () => {
  assert.equal(i18n.translate('ar', 'missing.demo', { defaultValue: 'Fallback copy' }), 'Fallback copy');
  assert.equal(i18n.translate('ar', 'fallbackOnly.label'), 'English fallback');
});
