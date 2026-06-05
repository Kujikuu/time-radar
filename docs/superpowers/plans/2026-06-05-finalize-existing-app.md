# Finalize Existing App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the existing TimeRadar app without adding features by restoring the test baseline, extracting pure rules, improving accessibility, tightening render work, and verifying the current flows.

**Architecture:** Keep Expo Router route files as screen composition and move pure business rules into focused files under `src/features/focus`. Keep SQLite access in `repository.ts` and `database.ts`, keep reusable UI controls in `src/components`, and avoid broad rewrites.

**Tech Stack:** Expo SDK 54, Expo Router 6, React Native 0.81, React 19, TypeScript 5.9, expo-sqlite, expo-notifications, node:test.

---

## Scope Notes

The approved spec is `docs/superpowers/specs/2026-06-05-finalize-existing-app-design.md`.

This plan does not add product features. It improves the existing task, timer, stats, onboarding, settings, notification, and UI foundations.

The current automated baseline fails because `test/tab-bar-labels.test.cjs` still rejects `borderTopLeftRadius` and `borderTopRightRadius`, while the app now intentionally uses a rounded bottom tab bar.

## File Structure

- Modify `.gitignore`: ignore generated `.test-build/`.
- Modify `test/tab-bar-labels.test.cjs`: align tab-bar assertions with current UI intent.
- Create `src/features/focus/stats-rules.ts`: pure stats summary, distribution, ranges, and formatting.
- Modify `src/features/focus/hooks.ts`: delegate stats derivation to `stats-rules.ts`.
- Modify `tsconfig.test.json`: compile new pure rule modules for node tests.
- Create `test/focus-stats-rules.test.cjs`: verify stats behavior without React or SQLite.
- Create `src/features/focus/timer-snapshot-rules.ts`: pure timer snapshot display helpers.
- Modify `src/features/focus/repository.ts`: use timer snapshot helpers.
- Create `test/focus-timer-snapshot-rules.test.cjs`: verify snapshot progress, phase labels, and action labels.
- Modify `src/components/PrimaryButton.tsx`: support labels, disabled state, and accessibility state.
- Modify `src/components/SegmentedControl.tsx`: expose selected state and labels.
- Modify `src/features/focus/FocusTaskCard.tsx`: add useful task card accessibility label.
- Modify `src/features/focus/TimerRing.tsx`: add button labels, selected timer text, and safer disabled handling.
- Modify `src/features/focus/TaskForm.tsx`: label inputs and improve validation affordances without changing the form flow.
- Modify `app/(tabs)/index.tsx`: label the stats navigation control.
- Modify `app/(tabs)/settings.tsx`: label switches and preserve disabled state semantics.
- Modify `src/components/MetricCard.tsx`: make metric values selectable and accessible.
- Modify `src/features/focus/FocusBarChart.tsx`: memoize chart geometry and provide an accessible chart summary.
- Modify `src/features/focus/DistributionDonut.tsx`: memoize segments and provide an accessible distribution summary.
- Create `test/accessibility-contracts.test.cjs`: source-level guardrails for the accessibility improvements.

---

### Task 1: Restore The Automated Baseline

**Files:**
- Modify: `.gitignore`
- Modify: `test/tab-bar-labels.test.cjs`

- [ ] **Step 1: Verify the current failing baseline**

Run:

```bash
npm test
```

Expected: FAIL in `test/tab-bar-labels.test.cjs` with an assertion that the tab layout should not contain `borderTopLeftRadius`.

- [ ] **Step 2: Ignore generated test build output**

Add `.test-build/` to the TypeScript generated output section of `.gitignore`:

```gitignore
# typescript
*.tsbuildinfo
.test-build/
```

- [ ] **Step 3: Update the tab-bar test to match the current rounded bar**

Replace `test/tab-bar-labels.test.cjs` with:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const tabsLayoutSource = fs.readFileSync(path.join(__dirname, '../app/(tabs)/_layout.tsx'), 'utf8');

test('bottom tab bar renders icon-only items', () => {
  assert.match(tabsLayoutSource, /tabBarShowLabel:\s*false/);
  assert.doesNotMatch(tabsLayoutSource, /tabBarLabelStyle:/);
});

test('bottom tab bar is fixed to the mobile bottom edge without extra safe-area growth', () => {
  assert.match(tabsLayoutSource, /safeAreaInsets=\{\{\s*bottom:\s*0,\s*\}\}/s);
  assert.match(tabsLayoutSource, /height:\s*78/);
  assert.match(tabsLayoutSource, /position:\s*'absolute'/);
  assert.match(tabsLayoutSource, /left:\s*0/);
  assert.match(tabsLayoutSource, /right:\s*0/);
  assert.match(tabsLayoutSource, /bottom:\s*0/);
  assert.doesNotMatch(tabsLayoutSource, /marginBottom:/);
  assert.doesNotMatch(tabsLayoutSource, /marginTop:/);
  assert.match(tabsLayoutSource, /paddingTop:\s*10/);
});

test('bottom tab bar keeps the approved rounded connected shape', () => {
  assert.match(tabsLayoutSource, /borderTopLeftRadius:\s*radius\.lg/);
  assert.match(tabsLayoutSource, /borderTopRightRadius:\s*radius\.lg/);
  assert.match(tabsLayoutSource, /overflow:\s*'hidden'/);
});
```

- [ ] **Step 4: Run tests to verify baseline is green**

Run:

```bash
npm test
```

Expected: PASS for all tests.

- [ ] **Step 5: Commit baseline cleanup**

```bash
git add .gitignore test/tab-bar-labels.test.cjs
git commit -m "test: restore baseline for tab bar"
```

---

### Task 2: Extract And Test Stats Rules

**Files:**
- Create: `src/features/focus/stats-rules.ts`
- Modify: `src/features/focus/hooks.ts`
- Modify: `tsconfig.test.json`
- Create: `test/focus-stats-rules.test.cjs`

- [ ] **Step 1: Add failing stats tests**

Create `test/focus-stats-rules.test.cjs`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');

const statsRules = require('../.test-build/features/focus/stats-rules.js');

const categoryColors = {
  Work: '#work',
  Study: '#study',
  Personal: '#personal',
};

function session(overrides) {
  return {
    id: overrides.id,
    taskId: overrides.taskId ?? 'task-1',
    taskTitle: overrides.taskTitle ?? 'Task',
    category: overrides.category ?? 'Work',
    phase: overrides.phase ?? 'focus',
    startedAt: overrides.startedAt ?? '2026-06-05T09:00:00.000Z',
    endedAt: overrides.endedAt ?? '2026-06-05T09:25:00.000Z',
    plannedSeconds: overrides.plannedSeconds ?? 1500,
    actualSeconds: overrides.actualSeconds ?? 1500,
    status: overrides.status ?? 'completed',
  };
}

test('stats summary counts only focus sessions and preserves distribution colors', () => {
  const summary = statsRules.buildStatsSummary({
    range: 'Day',
    sessions: [
      session({ id: 'work-focus', category: 'Work', actualSeconds: 25 * 60 }),
      session({ id: 'study-focus', category: 'Study', actualSeconds: 30 * 60 }),
      session({ id: 'break', category: 'Work', phase: 'short_break', actualSeconds: 5 * 60 }),
    ],
    previousSessions: [
      session({ id: 'previous-focus', category: 'Work', actualSeconds: 25 * 60 }),
    ],
    categoryColors,
    now: new Date('2026-06-05T12:00:00.000Z'),
  });

  assert.equal(summary.focusMinutes, 55);
  assert.equal(summary.focusTime, '55m');
  assert.equal(summary.sessions, '2');
  assert.equal(summary.focusScore, '50%');
  assert.equal(summary.trendPercent, 120);
  assert.deepEqual(summary.distribution, [
    { label: 'Work', minutes: 25, color: '#work' },
    { label: 'Study', minutes: 30, color: '#study' },
    { label: 'Personal', minutes: 0, color: '#personal' },
  ]);
});

test('empty stats keep stable chart and distribution shapes', () => {
  const summary = statsRules.emptyStats('Week', categoryColors, new Date('2026-06-05T12:00:00.000Z'));

  assert.equal(summary.focusTime, '0m');
  assert.equal(summary.sessions, '0');
  assert.equal(summary.focusScore, '0%');
  assert.equal(summary.hourlyFocus.length, 7);
  assert.deepEqual(summary.distribution, [
    { label: 'Work', minutes: 0, color: '#work' },
    { label: 'Study', minutes: 0, color: '#study' },
    { label: 'Personal', minutes: 0, color: '#personal' },
  ]);
});

test('week range starts on Monday and ends seven days later', () => {
  const window = statsRules.rangeWindow('Week', new Date('2026-06-05T12:00:00.000Z'));

  assert.equal(window.start.getDay(), 1);
  assert.equal(window.start.getDate(), 1);
  assert.equal(window.end.getDate(), 8);
});
```

- [ ] **Step 2: Include stats rules in test compilation**

Update `tsconfig.test.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": ".test-build",
    "noEmit": false,
    "noEmitOnError": true
  },
  "include": [
    "src/features/focus/types.ts",
    "src/features/focus/timer-rules.ts",
    "src/features/focus/notification-rules.ts",
    "src/features/focus/stats-rules.ts"
  ]
}
```

- [ ] **Step 3: Run tests to verify the stats module is missing**

Run:

```bash
npm test
```

Expected: FAIL because `.test-build/features/focus/stats-rules.js` does not exist yet.

- [ ] **Step 4: Create the pure stats rules module**

Create `src/features/focus/stats-rules.ts`:

```ts
import type {
  BarPoint,
  DistributionItem,
  FocusCategory,
  FocusSession,
  StatsRange,
  StatsSummary,
} from './types';

export type FocusCategoryColors = Record<FocusCategory, string>;

type BuildStatsSummaryInput = {
  range: StatsRange;
  sessions: FocusSession[];
  previousSessions: FocusSession[];
  categoryColors: FocusCategoryColors;
  now?: Date;
};

const categories: FocusCategory[] = ['Work', 'Study', 'Personal'];

export function buildStatsSummary({
  range,
  sessions,
  previousSessions,
  categoryColors,
  now = new Date(),
}: BuildStatsSummaryInput): StatsSummary {
  const focusSessions = sessions.filter((session) => session.phase === 'focus');
  const previousFocusSessions = previousSessions.filter((session) => session.phase === 'focus');
  const focusMinutes = sumSessions(focusSessions);
  const previousMinutes = sumSessions(previousFocusSessions);
  const trendPercent =
    previousMinutes === 0
      ? focusMinutes > 0
        ? 100
        : 0
      : Math.round(((focusMinutes - previousMinutes) / previousMinutes) * 100);

  return {
    range,
    label: rangeLabel(range, now),
    focusTime: formatMinutes(focusMinutes),
    focusMinutes,
    sessions: String(focusSessions.length),
    focusScore: `${Math.min(100, focusSessions.length * 25)}%`,
    trendPercent,
    hourlyFocus: buildBars(range, focusSessions),
    distribution: buildDistribution(focusSessions, categoryColors),
  };
}

export function emptyStats(
  range: StatsRange,
  categoryColors: FocusCategoryColors,
  now = new Date()
): StatsSummary {
  return {
    range,
    label: rangeLabel(range, now),
    focusTime: formatMinutes(0),
    focusMinutes: 0,
    sessions: '0',
    focusScore: '0%',
    trendPercent: 0,
    hourlyFocus: buildBars(range, []),
    distribution: buildDistribution([], categoryColors),
  };
}

export function rangeWindow(range: StatsRange, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (range === 'Week') {
    const day = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - day);
  } else if (range === 'Month') {
    start.setDate(1);
  } else if (range === 'Year') {
    start.setMonth(0, 1);
  }

  const end = new Date(start);
  if (range === 'Day') {
    end.setDate(end.getDate() + 1);
  } else if (range === 'Week') {
    end.setDate(end.getDate() + 7);
  } else if (range === 'Month') {
    end.setMonth(end.getMonth() + 1);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }

  return { start, end };
}

export function previousRangeWindow(range: StatsRange, currentStart: Date) {
  const end = new Date(currentStart);
  const start = new Date(currentStart);

  if (range === 'Day') {
    start.setDate(start.getDate() - 1);
  } else if (range === 'Week') {
    start.setDate(start.getDate() - 7);
  } else if (range === 'Month') {
    start.setMonth(start.getMonth() - 1);
  } else {
    start.setFullYear(start.getFullYear() - 1);
  }

  return { start, end };
}

export function formatMinutes(minutes: number) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  return `${minutes}m`;
}

function buildBars(range: StatsRange, sessions: FocusSession[]): BarPoint[] {
  if (range === 'Day') {
    const buckets = [0, 3, 6, 9, 12, 15, 18, 21, 24];

    return buckets.map((hour) => ({
      label: hour === 0 || hour === 24 ? '12 AM' : hour === 12 ? '12 PM' : `${hour % 12} ${hour < 12 ? 'AM' : 'PM'}`,
      minutes: sumSessions(
        sessions.filter((session) => {
          const sessionHour = new Date(session.startedAt).getHours();
          return hour === 24 ? false : sessionHour >= hour && sessionHour < hour + 3;
        })
      ),
    }));
  }

  const labels =
    range === 'Week'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : range === 'Year'
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        : ['1', '5', '10', '15', '20', '25', '30'];

  return labels.map((label, index) => ({
    label,
    minutes: sumSessions(
      sessions.filter((session) => {
        const date = new Date(session.startedAt);
        if (range === 'Week') {
          return (date.getDay() + 6) % 7 === index;
        }

        if (range === 'Year') {
          return date.getMonth() === index;
        }

        return Math.floor((date.getDate() - 1) / 5) === index;
      })
    ),
  }));
}

function buildDistribution(
  sessions: FocusSession[],
  categoryColors: FocusCategoryColors
): DistributionItem[] {
  return categories.map((category) => ({
    label: category,
    minutes: sumSessions(sessions.filter((session) => session.category === category)),
    color: categoryColors[category],
  }));
}

function sumSessions(sessions: FocusSession[]) {
  return Math.round(sessions.reduce((sum, session) => sum + session.actualSeconds, 0) / 60);
}

function rangeLabel(range: StatsRange, now: Date) {
  if (range === 'Day') {
    return `Today, ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  return range;
}
```

- [ ] **Step 5: Use stats rules from hooks**

In `src/features/focus/hooks.ts`, add this import:

```ts
import {
  buildStatsSummary,
  emptyStats,
  previousRangeWindow,
  rangeWindow,
  type FocusCategoryColors,
} from './stats-rules';
```

Replace the focus type import with the reduced list that remains after extracting stats rules:

```ts
import {
  AppSettings,
  FocusTask,
  ProgressMetric,
  StatsRange,
  StatsSummary,
  TaskInput,
  TimerSnapshot,
} from './types';
```

Add the category color map near the top-level constants:

```ts
const focusCategoryColors: FocusCategoryColors = {
  Work: colors.accent,
  Study: colors.greenSoft,
  Personal: colors.blue,
};
```

Update `useStats` initialization and summary building:

```ts
const [summary, setSummary] = useState<StatsSummary>(() =>
  emptyStats(range, focusCategoryColors)
);
```

```ts
const window = rangeWindow(range);
const previousWindow = previousRangeWindow(range, window.start);
```

```ts
setSummary(
  buildStatsSummary({
    range,
    sessions,
    previousSessions,
    categoryColors: focusCategoryColors,
  })
);
```

Remove these local functions from `src/features/focus/hooks.ts` after the import is wired:

```ts
buildStats
buildBars
buildDistribution
sumSessions
rangeWindow
previousRangeWindow
rangeLabel
emptyStats
formatMinutes
```

- [ ] **Step 6: Run stats tests**

Run:

```bash
npm test
```

Expected: PASS for all tests, including `focus-stats-rules.test.cjs`.

- [ ] **Step 7: Commit stats extraction**

```bash
git add src/features/focus/stats-rules.ts src/features/focus/hooks.ts tsconfig.test.json test/focus-stats-rules.test.cjs
git commit -m "refactor: extract focus stats rules"
```

---

### Task 3: Extract And Test Timer Snapshot Rules

**Files:**
- Create: `src/features/focus/timer-snapshot-rules.ts`
- Modify: `src/features/focus/repository.ts`
- Modify: `tsconfig.test.json`
- Create: `test/focus-timer-snapshot-rules.test.cjs`

- [ ] **Step 1: Add failing timer snapshot tests**

Create `test/focus-timer-snapshot-rules.test.cjs`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');

const snapshotRules = require('../.test-build/features/focus/timer-snapshot-rules.js');

test('timer progress is clamped and handles invalid planned seconds', () => {
  assert.equal(snapshotRules.resolveTimerProgress({ plannedSeconds: 1500, remainingSeconds: 1500 }), 0);
  assert.equal(snapshotRules.resolveTimerProgress({ plannedSeconds: 1500, remainingSeconds: 750 }), 0.5);
  assert.equal(snapshotRules.resolveTimerProgress({ plannedSeconds: 1500, remainingSeconds: -20 }), 1);
  assert.equal(snapshotRules.resolveTimerProgress({ plannedSeconds: 0, remainingSeconds: 0 }), 0);
});

test('phase labels stay user-facing and stable', () => {
  assert.equal(snapshotRules.resolvePhaseLabel('focus'), 'Focus');
  assert.equal(snapshotRules.resolvePhaseLabel('short_break'), 'Short Break');
  assert.equal(snapshotRules.resolvePhaseLabel('long_break'), 'Long Break');
});

test('primary action labels reflect empty, running, and paused timer states', () => {
  assert.equal(snapshotRules.resolvePrimaryActionLabel(null), 'Start');
  assert.equal(snapshotRules.resolvePrimaryActionLabel({ status: 'running' }), 'Pause');
  assert.equal(snapshotRules.resolvePrimaryActionLabel({ status: 'paused' }), 'Resume');
});
```

- [ ] **Step 2: Run tests to verify the snapshot module is missing**

Run:

```bash
npm test
```

Expected: FAIL because `.test-build/features/focus/timer-snapshot-rules.js` does not exist yet.

- [ ] **Step 3: Create timer snapshot rules**

Create `src/features/focus/timer-snapshot-rules.ts`:

```ts
import type { ActiveTimer, TimerPhase } from './types';

export function resolveTimerProgress({
  plannedSeconds,
  remainingSeconds,
}: Pick<ActiveTimer, 'plannedSeconds' | 'remainingSeconds'>) {
  if (!Number.isFinite(plannedSeconds) || plannedSeconds <= 0) {
    return 0;
  }

  const progress = 1 - remainingSeconds / plannedSeconds;
  return Math.min(Math.max(progress, 0), 1);
}

export function resolvePhaseLabel(phase: TimerPhase) {
  if (phase === 'short_break') {
    return 'Short Break';
  }

  if (phase === 'long_break') {
    return 'Long Break';
  }

  return 'Focus';
}

export function resolvePrimaryActionLabel(timer: Pick<ActiveTimer, 'status'> | null) {
  if (!timer) {
    return 'Start';
  }

  return timer.status === 'running' ? 'Pause' : 'Resume';
}
```

- [ ] **Step 4: Include snapshot rules in test compilation**

Update `tsconfig.test.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": ".test-build",
    "noEmit": false,
    "noEmitOnError": true
  },
  "include": [
    "src/features/focus/types.ts",
    "src/features/focus/timer-rules.ts",
    "src/features/focus/timer-snapshot-rules.ts",
    "src/features/focus/notification-rules.ts",
    "src/features/focus/stats-rules.ts"
  ]
}
```

- [ ] **Step 5: Use snapshot rules in repository**

In `src/features/focus/repository.ts`, add:

```ts
import {
  resolvePhaseLabel,
  resolvePrimaryActionLabel,
  resolveTimerProgress,
} from './timer-snapshot-rules';
```

Update `getActiveTimerSnapshot`:

```ts
export async function getActiveTimerSnapshot(db: SQLiteDatabase): Promise<TimerSnapshot> {
  const timer = await getActiveTimer(db);
  const task = timer ? await getTask(db, timer.taskId) : null;
  const remainingSeconds = timer ? resolveRemainingSeconds(timer) : 0;

  return {
    timer,
    task,
    remainingSeconds,
    progress: timer
      ? resolveTimerProgress({ plannedSeconds: timer.plannedSeconds, remainingSeconds })
      : 0,
    display: formatSeconds(remainingSeconds),
    phaseLabel: timer ? resolvePhaseLabel(timer.phase) : 'Focus',
    primaryActionLabel: resolvePrimaryActionLabel(timer),
  };
}
```

Remove the local `phaseLabel` function from `src/features/focus/repository.ts`.

- [ ] **Step 6: Run timer snapshot tests**

Run:

```bash
npm test
```

Expected: PASS for all tests, including `focus-timer-snapshot-rules.test.cjs`.

- [ ] **Step 7: Commit timer snapshot extraction**

```bash
git add src/features/focus/timer-snapshot-rules.ts src/features/focus/repository.ts tsconfig.test.json test/focus-timer-snapshot-rules.test.cjs
git commit -m "refactor: extract timer snapshot rules"
```

---

### Task 4: Improve Shared Control Accessibility

**Files:**
- Modify: `src/components/PrimaryButton.tsx`
- Modify: `src/components/SegmentedControl.tsx`
- Modify: `src/features/focus/FocusTaskCard.tsx`
- Modify: `src/features/focus/TimerRing.tsx`
- Modify: `src/features/focus/TaskForm.tsx`
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/(tabs)/settings.tsx`
- Create: `test/accessibility-contracts.test.cjs`

- [ ] **Step 1: Add failing accessibility contract tests**

Create `test/accessibility-contracts.test.cjs`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

test('shared buttons expose labels and disabled accessibility state', () => {
  const primaryButtonSource = read('src/components/PrimaryButton.tsx');

  assert.match(primaryButtonSource, /accessibilityLabel=\{resolvedAccessibilityLabel\}/);
  assert.match(primaryButtonSource, /accessibilityState=\{\{ disabled \}\}/);
  assert.match(primaryButtonSource, /disabled=\{disabled\}/);
});

test('segmented control exposes selected state for each option', () => {
  const segmentedControlSource = read('src/components/SegmentedControl.tsx');

  assert.match(segmentedControlSource, /accessibilityLabel=\{option\}/);
  assert.match(segmentedControlSource, /accessibilityState=\{\{ selected: isActive \}\}/);
});

test('timer and task controls include descriptive accessibility labels', () => {
  const timerRingSource = read('src/features/focus/TimerRing.tsx');
  const taskCardSource = read('src/features/focus/FocusTaskCard.tsx');

  assert.match(timerRingSource, /accessibilityLabel=\{displayAction\}/);
  assert.match(timerRingSource, /accessibilityLabel="Reset timer"/);
  assert.match(timerRingSource, /accessibilityLabel="Complete current phase"/);
  assert.match(taskCardSource, /accessibilityLabel=\{`Open \$\{task\.title\} focus task, \$\{task\.focusMinutes\} minutes`\}/);
});

test('task form inputs are accessible by label', () => {
  const taskFormSource = read('src/features/focus/TaskForm.tsx');

  assert.match(taskFormSource, /accessibilityLabel="Task name"/);
  assert.match(taskFormSource, /accessibilityLabel=\{label\}/);
});
```

- [ ] **Step 2: Run tests to verify accessibility contracts fail**

Run:

```bash
npm test
```

Expected: FAIL in `accessibility-contracts.test.cjs`.

- [ ] **Step 3: Update PrimaryButton**

Replace `src/components/PrimaryButton.tsx` with:

```tsx
import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, typography } from '@/src/theme';

type PrimaryButtonProps = PropsWithChildren<{
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
  disabled?: boolean;
}>;

export function PrimaryButton({
  children,
  onPress,
  style,
  accessibilityLabel,
  disabled = false,
}: PrimaryButtonProps) {
  const resolvedAccessibilityLabel =
    accessibilityLabel ?? (typeof children === 'string' ? children : undefined);

  return (
    <Pressable
      accessibilityLabel={resolvedAccessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      <Text style={styles.label}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  disabled: {
    opacity: 0.52,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  label: {
    color: colors.white,
    fontFamily: typography.family,
    fontSize: 16,
    fontWeight: '700',
  },
});
```

- [ ] **Step 4: Update SegmentedControl**

Replace the `Pressable` in `src/components/SegmentedControl.tsx` with:

```tsx
<Pressable
  accessibilityLabel={option}
  accessibilityRole="button"
  accessibilityState={{ selected: isActive }}
  key={option}
  onPress={() => onChange(option)}
  style={[styles.segment, isActive && styles.activeSegment]}>
  <Text style={[styles.label, isActive && styles.activeLabel]}>{option}</Text>
</Pressable>
```

- [ ] **Step 5: Update task and home navigation labels**

In `src/features/focus/FocusTaskCard.tsx`, update the root `Pressable`:

```tsx
<Pressable
  accessibilityLabel={`Open ${task.title} focus task, ${task.focusMinutes} minutes`}
  accessibilityRole="button"
  onPress={() => router.push(`/session/${task.id}`)}
  style={({ pressed }) => pressed && styles.pressed}>
```

In `app/(tabs)/index.tsx`, update the stats navigation `Pressable`:

```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Open full stats"
  onPress={() => router.push('/(tabs)/stats' as never)}>
  <Text style={styles.linkText}>See all</Text>
</Pressable>
```

- [ ] **Step 6: Update TimerRing labels and important text**

In `src/features/focus/TimerRing.tsx`, update the time text:

```tsx
<Text selectable style={styles.time}>{time}</Text>
```

Update the primary action `Pressable`:

```tsx
<Pressable
  accessibilityLabel={displayAction}
  accessibilityRole="button"
  onPress={onPrimaryAction}
  style={({ pressed }) => [
    styles.startButton,
    isPaused && styles.resumeButton,
    pressed && styles.pressed,
  ]}>
```

Update reset and complete action pressables:

```tsx
<Pressable
  accessibilityLabel="Reset timer"
  accessibilityRole="button"
  onPress={onReset}
  hitSlop={8}
  style={({ pressed }) => [styles.iconAction, pressed && styles.secondaryPressed]}>
```

```tsx
<Pressable
  accessibilityLabel="Complete current phase"
  accessibilityRole="button"
  onPress={onComplete}
  hitSlop={8}
  style={({ pressed }) => [styles.iconAction, pressed && styles.secondaryPressed]}>
```

- [ ] **Step 7: Update TaskForm labels**

In `src/features/focus/TaskForm.tsx`, update the task name input:

```tsx
<TextInput
  accessibilityLabel="Task name"
  value={title}
  onChangeText={setTitle}
  style={styles.input}
/>
```

Update `NumberField`'s `TextInput`:

```tsx
<TextInput
  accessibilityLabel={label}
  value={value}
  onChangeText={(nextValue) => onChangeText(nextValue.replace(/[^0-9]/g, ''))}
  keyboardType="number-pad"
  style={styles.numberInput}
/>
```

- [ ] **Step 8: Update settings switches**

In `app/(tabs)/settings.tsx`, update the `Switch` inside `SwitchRow`:

```tsx
<Switch
  accessibilityLabel={label}
  accessibilityState={{ disabled, checked: value }}
  disabled={disabled}
  value={value}
  onValueChange={onValueChange}
  trackColor={{ false: colors.borderStrong, true: colors.accentSoft }}
  thumbColor={value ? colors.accent : colors.surface}
/>
```

- [ ] **Step 9: Run accessibility contract tests**

Run:

```bash
npm test
```

Expected: PASS for all tests, including `accessibility-contracts.test.cjs`.

- [ ] **Step 10: Commit accessibility improvements**

```bash
git add src/components/PrimaryButton.tsx src/components/SegmentedControl.tsx src/features/focus/FocusTaskCard.tsx src/features/focus/TimerRing.tsx src/features/focus/TaskForm.tsx 'app/(tabs)/index.tsx' 'app/(tabs)/settings.tsx' test/accessibility-contracts.test.cjs
git commit -m "chore: harden control accessibility"
```

---

### Task 5: Tighten Chart And Metric Render Work

**Files:**
- Modify: `src/components/MetricCard.tsx`
- Modify: `src/features/focus/FocusBarChart.tsx`
- Modify: `src/features/focus/DistributionDonut.tsx`

- [ ] **Step 1: Update MetricCard for accessible selectable data**

Replace the return body in `src/components/MetricCard.tsx` with:

```tsx
return (
  <View
    accessibilityLabel={`${label}: ${value}`}
    accessibilityRole="summary"
    style={styles.card}>
    <AppIcon icon={icon} size={25} color={toneColor[tone]} />
    <Text selectable style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);
```

- [ ] **Step 2: Memoize FocusBarChart geometry and add a chart summary**

Replace `src/features/focus/FocusBarChart.tsx` with:

```tsx
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { colors, typography } from '@/src/theme';

import { BarPoint } from './types';

type FocusBarChartProps = {
  data: BarPoint[];
};

const chartTicks = [0, 15, 30, 45, 60];
const chartWidth = 310;
const chartHeight = 160;
const chartTop = 12;
const chartAreaHeight = 112;
const chartBarWidth = 9;
const chartMaxMinutes = 60;

export const FocusBarChart = memo(function FocusBarChart({ data }: FocusBarChartProps) {
  const summary = useMemo(() => {
    const total = data.reduce((sum, point) => sum + point.minutes, 0);
    return `Focus chart, ${total} total minutes`;
  }, [data]);
  const bars = useMemo(() => {
    const safeGap = data.length > 1 ? (chartWidth - 52) / (data.length - 1) : 0;

    return data.map((point, index) => {
      const barHeight = Math.max(4, (point.minutes / chartMaxMinutes) * chartAreaHeight);

      return {
        key: `${point.label}-${index}`,
        labelKey: `${point.label}-label-${index}`,
        label: point.label,
        x: 38 + safeGap * index,
        labelX: 28 + safeGap * index,
        y: chartTop + chartAreaHeight - barHeight,
        height: barHeight,
        opacity: point.minutes > 35 ? 0.48 : 0.24,
        showLabel: index % 2 === 0,
      };
    });
  }, [data]);

  return (
    <View
      accessible
      accessibilityLabel={summary}
      accessibilityRole="image"
      style={styles.wrapper}>
      <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {chartTicks.map((tick) => {
          const y = chartTop + chartAreaHeight - (tick / chartMaxMinutes) * chartAreaHeight;

          return (
            <Line
              key={tick}
              x1="34"
              x2={chartWidth - 8}
              y1={y}
              y2={y}
              stroke={colors.borderStrong}
              strokeWidth="1"
              opacity="0.75"
            />
          );
        })}
        {chartTicks.map((tick) => {
          const y = chartTop + chartAreaHeight - (tick / chartMaxMinutes) * chartAreaHeight + 4;

          return (
            <SvgText
              key={tick}
              x="0"
              y={y}
              fill={colors.textMuted}
              fontSize="10"
              fontFamily={typography.family}>
              {tick}m
            </SvgText>
          );
        })}
        {bars.map((bar) => (
          <Rect
            key={bar.key}
            x={bar.x}
            y={bar.y}
            width={chartBarWidth}
            height={bar.height}
            rx={4}
            fill={colors.accent}
            opacity={bar.opacity}
          />
        ))}
        {bars.map((bar) =>
          bar.showLabel ? (
            <SvgText
              key={bar.labelKey}
              x={bar.labelX}
              y={chartHeight - 7}
              fill={colors.textMuted}
              fontSize="10"
              fontFamily={typography.family}>
              {bar.label}
            </SvgText>
          ) : null
        )}
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
});
```

- [ ] **Step 3: Memoize DistributionDonut segments and add summary**

Replace `src/features/focus/DistributionDonut.tsx` with:

```tsx
import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, typography } from '@/src/theme';

import { DistributionItem } from './types';

type DistributionDonutProps = {
  data: DistributionItem[];
};

export const DistributionDonut = memo(function DistributionDonut({ data }: DistributionDonutProps) {
  const size = 128;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = useMemo(() => data.reduce((sum, item) => sum + item.minutes, 0), [data]);
  const summary = useMemo(
    () =>
      data
        .map((item) => `${item.label} ${formatMinutes(item.minutes)}`)
        .join(', '),
    [data]
  );
  const segments = useMemo(() => {
    let offset = 0;

    return data.flatMap((item) => {
      if (total === 0) {
        return [];
      }

      const portion = item.minutes / total;
      const dash = portion * circumference;
      const segment = {
        item,
        dash,
        strokeDashoffset: -offset,
      };
      offset += dash;

      return [segment];
    });
  }, [circumference, data, total]);

  return (
    <View
      accessible
      accessibilityLabel={`Focus distribution, ${summary}`}
      accessibilityRole="image"
      style={styles.wrapper}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceMuted}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {segments.map(({ item, dash, strokeDashoffset }) => (
          <Circle
            key={item.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={item.color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ))}
        <Circle cx={size / 2} cy={size / 2} r={28} fill={colors.background} />
      </Svg>
      <View style={styles.legend}>
        {data.map((item) => (
          <View key={item.label} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
            <Text selectable style={styles.legendValue}>{formatMinutes(item.minutes)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

function formatMinutes(minutes: number) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
  }

  return `${minutes}m`;
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  legend: {
    flex: 1,
    gap: 17,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 13,
    height: 13,
    borderRadius: 999,
  },
  legendLabel: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 14,
  },
  legendValue: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 14,
    fontWeight: '500',
  },
});
```

- [ ] **Step 4: Run checks**

Run:

```bash
npm test
npx tsc --noEmit
npm run lint
```

Expected: all commands PASS.

- [ ] **Step 5: Commit render polish**

```bash
git add src/components/MetricCard.tsx src/features/focus/FocusBarChart.tsx src/features/focus/DistributionDonut.tsx
git commit -m "chore: tighten stats rendering"
```

---

### Task 6: Full Verification And Release Notes

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace starter README with app-specific notes**

Replace `README.md` with:

````md
# TimeRadar

TimeRadar is a focused Expo app for creating simple focus tasks, running timed focus sessions, and reviewing lightweight progress stats.

## Stack

- Expo SDK 54
- Expo Router
- React Native
- TypeScript
- expo-sqlite
- expo-notifications
- Poppins via `@expo-google-fonts/poppins`

## Development

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npx expo start
```

Run automated checks:

```bash
npm test
npx tsc --noEmit
npm run lint
git diff --check
```

## Current Product Scope

- Onboarding
- Focus tasks
- Focus timer with break phases
- Local SQLite persistence
- Completion notifications
- Daily, weekly, monthly, and yearly stats
- Timer defaults, notification settings, and haptics settings
````

- [ ] **Step 2: Run full automated verification**

Run:

```bash
npm test
npx tsc --noEmit
npm run lint
git diff --check
```

Expected: all commands PASS.

- [ ] **Step 3: Run Expo web smoke check**

Start Expo web:

```bash
npx expo start --web --port 8082
```

Expected: Expo starts and serves the app on `http://localhost:8082`.

In a second terminal, run:

```bash
curl -I http://localhost:8082
```

Expected: HTTP 200 or HTTP 302 from the Expo dev server.

- [ ] **Step 4: Manual smoke checks**

Open the app in Expo Go or web and verify:

```text
1. Onboarding can enter the tab app.
2. Home timer can start, pause, resume, reset, and complete.
3. Task creation routes to the session detail screen.
4. Task editing saves and keeps the same task route usable.
5. Stats renders after at least one session change.
6. Settings changes persist after navigating away and back.
7. Notification settings remain disabled or enabled according to current permission state.
8. Bottom tab bar remains fixed at the bottom and does not cover the final settings controls.
```

- [ ] **Step 5: Commit README and verification closeout**

```bash
git add README.md
git commit -m "docs: document TimeRadar development checks"
```

- [ ] **Step 6: Confirm final status**

Run:

```bash
git status --short
git log --oneline -6
```

Expected: only intentionally untracked local generated files remain, and the recent commits match the completed tasks.

---

## Self-Review Notes

- Spec coverage: the plan covers baseline verification, pure rule extraction, route-thin architecture, accessibility, render performance, README cleanup, and final automated/manual verification.
- Scope control: the plan does not add tabs, planning flows, new product entities, AI helpers, or advanced scheduling.
- Data safety: no database schema change is planned, so no migration is needed.
- Type consistency: new pure modules use existing `FocusSession`, `StatsRange`, `StatsSummary`, `ActiveTimer`, and `TimerPhase` types.
- Generated output: `.test-build/` is ignored and not committed.
