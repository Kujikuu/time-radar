const test = require('node:test');
const assert = require('node:assert/strict');

const statsRules = require('../.test-build/features/focus/stats-rules.js');

const categoryColors = {
  Work: '#111111',
  Study: '#22aa66',
  Personal: '#3377ff',
};

function session(overrides) {
  return {
    id: 'session',
    taskId: 'task',
    taskTitle: 'Task',
    category: 'Work',
    phase: 'focus',
    startedAt: '2026-06-01T12:00:00.000Z',
    endedAt: '2026-06-01T12:25:00.000Z',
    plannedSeconds: 25 * 60,
    actualSeconds: 25 * 60,
    status: 'completed',
    ...overrides,
  };
}

test('buildStatsSummary counts only focus sessions and preserves category colors', () => {
  const summary = statsRules.buildStatsSummary({
    range: 'Week',
    categoryColors,
    sessions: [
      session({
        id: 'work-focus',
        category: 'Work',
        startedAt: '2026-06-01T12:00:00.000Z',
        actualSeconds: 20 * 60,
      }),
      session({
        id: 'study-focus',
        category: 'Study',
        startedAt: '2026-06-02T12:00:00.000Z',
        actualSeconds: 35 * 60,
      }),
      session({
        id: 'break',
        category: 'Personal',
        phase: 'short_break',
        startedAt: '2026-06-03T12:00:00.000Z',
        actualSeconds: 10 * 60,
      }),
    ],
    previousSessions: [
      session({
        id: 'previous-focus',
        startedAt: '2026-05-25T12:00:00.000Z',
        actualSeconds: 25 * 60,
      }),
    ],
    now: new Date('2026-06-05T12:00:00.000Z'),
  });

  assert.equal(summary.focusMinutes, 55);
  assert.equal(summary.focusTime, '55m');
  assert.equal(summary.sessions, '2');
  assert.equal(summary.focusScore, '50%');
  assert.equal(summary.trendPercent, 120);
  assert.deepEqual(summary.distribution, [
    { label: 'Work', minutes: 20, color: categoryColors.Work },
    { label: 'Study', minutes: 35, color: categoryColors.Study },
    { label: 'Personal', minutes: 0, color: categoryColors.Personal },
  ]);
});

test('emptyStats returns a stable week chart shape and zero distribution', () => {
  const summary = statsRules.emptyStats(
    'Week',
    categoryColors,
    new Date('2026-06-05T12:00:00.000Z')
  );

  assert.deepEqual(summary.hourlyFocus, [
    { label: 'Mon', minutes: 0 },
    { label: 'Tue', minutes: 0 },
    { label: 'Wed', minutes: 0 },
    { label: 'Thu', minutes: 0 },
    { label: 'Fri', minutes: 0 },
    { label: 'Sat', minutes: 0 },
    { label: 'Sun', minutes: 0 },
  ]);
  assert.deepEqual(summary.distribution, [
    { label: 'Work', minutes: 0, color: categoryColors.Work },
    { label: 'Study', minutes: 0, color: categoryColors.Study },
    { label: 'Personal', minutes: 0, color: categoryColors.Personal },
  ]);
});

test('rangeWindow for week starts on Monday June 1 and ends June 8', () => {
  const window = statsRules.rangeWindow('Week', new Date('2026-06-05T12:00:00.000Z'));

  assert.equal(window.start.getFullYear(), 2026);
  assert.equal(window.start.getMonth(), 5);
  assert.equal(window.start.getDate(), 1);
  assert.equal(window.start.getDay(), 1);
  assert.equal(window.end.getFullYear(), 2026);
  assert.equal(window.end.getMonth(), 5);
  assert.equal(window.end.getDate(), 8);
});

test('emptyStats can produce Arabic range and chart labels without changing stored range values', () => {
  const weekSummary = statsRules.emptyStats(
    'Week',
    categoryColors,
    new Date('2026-06-05T12:00:00.000Z'),
    'ar'
  );
  const yearSummary = statsRules.emptyStats(
    'Year',
    categoryColors,
    new Date('2026-06-05T12:00:00.000Z'),
    'ar'
  );

  assert.equal(weekSummary.range, 'Week');
  assert.equal(weekSummary.label, 'الأسبوع');
  assert.deepEqual(
    weekSummary.hourlyFocus.map((point) => point.label),
    ['اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت', 'أحد']
  );
  assert.equal(yearSummary.hourlyFocus[0].label, 'ينا');
  assert.equal(yearSummary.hourlyFocus[10].label, 'نوف');
});
