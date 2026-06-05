const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const i18n = require('../.test-build/i18n/index.js');

const source = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

test('onboarding copy uses the calm professional focus voice in English and Arabic', () => {
  assert.equal(i18n.translate('en', 'onboarding.slides.sessionsTitle'), 'Set the work block');
  assert.equal(i18n.translate('en', 'onboarding.start'), 'Start focusing');
  assert.equal(i18n.translate('en', 'onboarding.skip'), 'Skip for now');
  assert.equal(
    i18n.translate('ar', 'onboarding.slides.sessionsTitle'),
    'اضبط جلسة العمل'
  );
  assert.equal(i18n.translate('ar', 'onboarding.skip'), 'تخطي الآن');
});

test('onboarding skip is an actual secondary action, not static helper copy', () => {
  const onboardingSource = source('app/index.tsx');

  assert.match(onboardingSource, /accessibilityLabel=\{t\('onboarding\.skip'\)\}/);
  assert.match(onboardingSource, /accessibilityRole="button"/);
  assert.match(onboardingSource, /onPress=\{\(\) => enterApp\(\)\}/);
});

test('task queue copy handles empty, one, and many states without fallback labels', () => {
  assert.equal(
    i18n.translate('en', 'tasks.queueBody.empty'),
    'No saved focus tasks yet. Add the first one when you know what needs attention.'
  );
  assert.equal(
    i18n.translate('en', 'tasks.queueBody.one', { values: { count: 1 } }),
    '1 focus task is ready for your next work block.'
  );
  assert.equal(
    i18n.translate('en', 'tasks.queueBody.many', { values: { count: 3 } }),
    '3 focus tasks are ready for focused work.'
  );
  assert.equal(
    i18n.translate('ar', 'tasks.queueBody.one', { values: { count: 1 } }),
    'هناك مهمة تركيز واحدة جاهزة لجلسة العمل التالية.'
  );
  assert.equal(
    i18n.translate('ar', 'tasks.queueBody.many', { values: { count: 3 } }),
    'لديك 3 من مهام التركيز جاهزة للعمل بتركيز.'
  );
});

test('home and tasks empty states include a clear create-task action', () => {
  const homeSource = source('app/(tabs)/index.tsx');
  const tasksSource = source('app/(tabs)/tasks.tsx');

  assert.equal(i18n.translate('en', 'home.noTasksAction'), 'Create focus task');
  assert.equal(i18n.translate('ar', 'home.noTasksAction'), 'إنشاء مهمة تركيز');
  assert.match(homeSource, /t\('home\.noTasksAction'\)/);
  assert.match(tasksSource, /tasks\.emptyAction/);
  assert.match(tasksSource, /tasks\.queueBody\.empty/);
  assert.match(tasksSource, /tasks\.queueBody\.one/);
  assert.match(tasksSource, /tasks\.queueBody\.many/);
});

test('task form guides and blocks blank task names before submit', () => {
  const taskFormSource = source('src/features/focus/TaskForm.tsx');

  assert.equal(i18n.translate('en', 'taskForm.taskNamePlaceholder'), 'What are you focusing on?');
  assert.equal(
    i18n.translate('ar', 'taskForm.taskNameRequired'),
    'سمّ مهمة التركيز قبل المتابعة.'
  );
  assert.match(taskFormSource, /placeholder=\{t\('taskForm\.taskNamePlaceholder'\)\}/);
  assert.match(taskFormSource, /setTitleError\(t\('taskForm\.taskNameRequired'\)\)/);
  assert.match(taskFormSource, /if \(!title\.trim\(\)\)/);
  assert.match(taskFormSource, /onPress=\{handleSubmit\}/);
});
