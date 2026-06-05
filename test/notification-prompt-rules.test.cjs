const test = require('node:test');
const assert = require('node:assert/strict');

const promptRules = require('../.test-build/features/focus/notification-prompt-rules.js');

const baseSettings = {
  onboardingCompleted: true,
  notificationPermissionPromptCompleted: false,
};

test('fresh onboarding users see the notification explanation before completion is persisted', () => {
  assert.equal(
    promptRules.shouldShowNotificationPermissionPrompt({
      settings: { ...baseSettings, onboardingCompleted: false },
      permissionStatus: 'undetermined',
      placement: 'onboarding',
    }),
    true
  );
});

test('existing onboarded users see one non-blocking home notification prompt', () => {
  assert.equal(
    promptRules.shouldShowNotificationPermissionPrompt({
      settings: baseSettings,
      permissionStatus: 'undetermined',
      placement: 'home',
    }),
    true
  );
});

test('notification prompt is hidden after completion or terminal permission states', () => {
  assert.equal(
    promptRules.shouldShowNotificationPermissionPrompt({
      settings: { ...baseSettings, notificationPermissionPromptCompleted: true },
      permissionStatus: 'undetermined',
      placement: 'home',
    }),
    false
  );
  assert.equal(
    promptRules.shouldShowNotificationPermissionPrompt({
      settings: baseSettings,
      permissionStatus: 'granted',
      placement: 'home',
    }),
    false
  );
  assert.equal(
    promptRules.shouldShowNotificationPermissionPrompt({
      settings: baseSettings,
      permissionStatus: 'denied',
      placement: 'home',
    }),
    false
  );
});
