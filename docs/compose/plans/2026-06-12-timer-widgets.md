# Timer Widgets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add iOS WidgetKit widgets (Small + Medium) that display the active focus timer countdown.

**Architecture:** Use `@bittingz/expo-widgets` to scaffold the iOS WidgetKit extension. Timer state is synced from the app to the widget via shared UserDefaults (App Groups). Widget reads UserDefaults on each timeline refresh and displays task name, phase, and countdown. Tapping the widget opens the app.

**Tech Stack:** Expo SDK 54, `@bittingz/expo-widgets`, Swift (WidgetKit), UserDefaults via App Groups, Expo Router URL scheme.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/widgets/types.ts` | Widget data type definitions |
| `src/widgets/timer-widget-data.ts` | Format timer state into widget-consumable data |
| `src/widgets/widget-sync.ts` | Write widget data to shared UserDefaults |
| `src/widgets/__tests__/timer-widget-data.test.ts` | Unit tests for data formatting |
| `ios/widgets/TimerWidget/` | Swift WidgetKit extension (Small + Medium) |
| `app.json` | Add expo-widget plugin, URL scheme, App Groups |
| `app/_layout.tsx` | Register deep link URL scheme |
| `src/features/focus/hooks.ts` | Call widget sync after timer state changes |

---

### Task 1: Install expo-widget and configure app.json

**Covers:** [S5, S8]

**Files:**
- Modify: `app.json`
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
npx expo install @bittingz/expo-widgets
```

- [ ] **Step 2: Add plugin to app.json**

In `app.json`, add the plugin and configure iOS:

```json
{
  "expo": {
    "plugins": [
      ["@bittingz/expo-widgets", {
        "ios": {
          "src": "./ios/widgets",
          "devTeamId": "YOUR_TEAM_ID",
          "mode": "production",
          "entitlements": {
            "com.apple.security.application-groups": ["group.com.sniper.timeradar"]
          }
        }
      }]
    ],
    "scheme": "time-radar"
  }
}
```

Replace `YOUR_TEAM_ID` with the actual Apple Developer Team ID. If unknown, use `"TEAM_ID_PLACEHOLDER"` — it must be set before the final build.

- [ ] **Step 3: Verify the plugin is recognized**

```bash
npx expo config --type public 2>&1 | grep -i widget
```

Expected: shows `@bittingz/expo-widgets` in the plugins list.

- [ ] **Step 4: Commit**

```bash
git add app.json package.json package-lock.json
git commit -m "chore: install expo-widget and configure app.json"
```

---

### Task 2: Create widget data types and formatting

**Covers:** [S3, S4, S5]

**Files:**
- Create: `src/widgets/types.ts`
- Create: `src/widgets/timer-widget-data.ts`
- Create: `src/widgets/__tests__/timer-widget-data.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/widgets/__tests__/timer-widget-data.test.ts`:

```ts
import { describe, expect, it } from '@jest/globals';

import { formatTimerWidgetData, type TimerWidgetInput } from '../timer-widget-data';

describe('formatTimerWidgetData', () => {
  it('returns null when timer is null', () => {
    expect(formatTimerWidgetData(null)).toBeNull();
  });

  it('formats running focus session', () => {
    const input: TimerWidgetInput = {
      taskTitle: 'Project Proposal',
      phase: 'focus',
      status: 'running',
      remainingSeconds: 1245,
      plannedSeconds: 1500,
    };

    const result = formatTimerWidgetData(input);

    expect(result).toEqual({
      taskTitle: 'Project Proposal',
      phase: 'Focus',
      status: 'running',
      remainingSeconds: 1245,
      plannedSeconds: 1500,
      displayTime: '20:45',
      progress: 0.17,
      updatedAt: expect.any(String),
    });
  });

  it('formats paused short break', () => {
    const input: TimerWidgetInput = {
      taskTitle: 'Market Research',
      phase: 'short_break',
      status: 'paused',
      remainingSeconds: 300,
      plannedSeconds: 300,
    };

    const result = formatTimerWidgetData(input);

    expect(result).toEqual({
      taskTitle: 'Market Research',
      phase: 'Short Break',
      status: 'paused',
      remainingSeconds: 300,
      plannedSeconds: 300,
      displayTime: '05:00',
      progress: 0,
      updatedAt: expect.any(String),
    });
  });

  it('formats long break', () => {
    const input: TimerWidgetInput = {
      taskTitle: 'Weekly Review',
      phase: 'long_break',
      status: 'running',
      remainingSeconds: 600,
      plannedSeconds: 900,
    };

    const result = formatTimerWidgetData(input);

    expect(result).toEqual({
      taskTitle: 'Weekly Review',
      phase: 'Long Break',
      status: 'running',
      remainingSeconds: 600,
      plannedSeconds: 900,
      displayTime: '10:00',
      progress: 0.33,
      updatedAt: expect.any(String),
    });
  });

  it('clamps progress between 0 and 1', () => {
    const input: TimerWidgetInput = {
      taskTitle: 'Test',
      phase: 'focus',
      status: 'running',
      remainingSeconds: -10,
      plannedSeconds: 1500,
    };

    const result = formatTimerWidgetData(input);
    expect(result!.progress).toBe(1);
  });

  it('returns 0 progress when plannedSeconds is 0', () => {
    const input: TimerWidgetInput = {
      taskTitle: 'Test',
      phase: 'focus',
      status: 'running',
      remainingSeconds: 0,
      plannedSeconds: 0,
    };

    const result = formatTimerWidgetData(input);
    expect(result!.progress).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest src/widgets/__tests__/timer-widget-data.test.ts --no-cache 2>&1 | tail -10
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create types and implementation**

Create `src/widgets/types.ts`:

```ts
export type WidgetPhase = 'focus' | 'short_break' | 'long_break';
export type WidgetStatus = 'running' | 'paused';

export type TimerWidgetInput = {
  taskTitle: string;
  phase: WidgetPhase;
  status: WidgetStatus;
  remainingSeconds: number;
  plannedSeconds: number;
};

export type TimerWidgetData = {
  taskTitle: string;
  phase: string;
  status: WidgetStatus;
  remainingSeconds: number;
  plannedSeconds: number;
  displayTime: string;
  progress: number;
  updatedAt: string;
};
```

Create `src/widgets/timer-widget-data.ts`:

```ts
import type { TimerWidgetData, TimerWidgetInput } from './types';

const phaseLabels: Record<string, string> = {
  focus: 'Focus',
  short_break: 'Short Break',
  long_break: 'Long Break',
};

function formatCountdown(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function computeProgress(remainingSeconds: number, plannedSeconds: number): number {
  if (!Number.isFinite(plannedSeconds) || plannedSeconds <= 0) {
    return 0;
  }

  const progress = 1 - remainingSeconds / plannedSeconds;
  return Math.min(Math.max(progress, 0), 1);
}

export function formatTimerWidgetData(input: TimerWidgetInput | null): TimerWidgetData | null {
  if (!input) {
    return null;
  }

  return {
    taskTitle: input.taskTitle,
    phase: phaseLabels[input.phase] ?? input.phase,
    status: input.status,
    remainingSeconds: input.remainingSeconds,
    plannedSeconds: input.plannedSeconds,
    displayTime: formatCountdown(input.remainingSeconds),
    progress: computeProgress(input.remainingSeconds, input.plannedSeconds),
    updatedAt: new Date().toISOString(),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest src/widgets/__tests__/timer-widget-data.test.ts --no-cache 2>&1 | tail -10
```

Expected: PASS, all 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/widgets/
git commit -m "feat: add widget data formatting with tests"
```

---

### Task 3: Create widget sync module

**Covers:** [S5]

**Files:**
- Create: `src/widgets/widget-sync.ts`

- [ ] **Step 1: Create the sync module**

Create `src/widgets/widget-sync.ts`:

```ts
import { Platform } from 'react-native';

import type { TimerWidgetInput } from './types';
import { formatTimerWidgetData } from './timer-widget-data';

const WIDGET_DATA_KEY = 'timer-widget-data';
const SUITE_NAME = 'group.com.sniper.timeradar';

let userDefaults: typeof import('@bittingz/expo-widgets').UserDefaults | null = null;

async function getUserDefaults() {
  if (userDefaults) {
    return userDefaults;
  }

  if (Platform.OS !== 'ios') {
    return null;
  }

  try {
    const { UserDefaults } = await import('@bittingz/expo-widgets');
    userDefaults = UserDefaults;
    return userDefaults;
  } catch {
    return null;
  }
}

export async function syncTimerToWidget(input: TimerWidgetInput | null): Promise<void> {
  const defaults = await getUserDefaults();

  if (!defaults) {
    return;
  }

  const data = formatTimerWidgetData(input);
  const serialized = data ? JSON.stringify(data) : null;

  defaults.setString(suiteName, WIDGET_DATA_KEY, serialized ?? '');
}

export async function clearWidgetData(): Promise<void> {
  const defaults = await getUserDefaults();

  if (!defaults) {
    return;
  }

  defaults.setString(suiteName, WIDGET_DATA_KEY, '');
}
```

- [ ] **Step 2: Commit**

```bash
git add src/widgets/widget-sync.ts
git commit -m "feat: add widget data sync via shared UserDefaults"
```

---

### Task 4: Create iOS WidgetKit extension

**Covers:** [S3, S4]

**Files:**
- Create: `ios/widgets/TimerWidget/TimerWidget.swift`
- Create: `ios/widgets/TimerWidget/TimerWidgetBundle.swift`
- Create: `ios/widgets/TimerWidget/TimerWidgetEntry.swift`
- Create: `ios/widgets/TimerWidget/TimerWidgetProvider.swift`
- Create: `ios/widgets/TimerWidget/SmallTimerWidget.swift`
- Create: `ios/widgets/TimerWidget/MediumTimerWidget.swift`
- Create: `ios/widgets/TimerWidget/Assets.xcassets/Contents.json`

- [ ] **Step 1: Create the directory structure**

```bash
mkdir -p ios/widgets/TimerWidget/Assets.xcassets/AppIcon.appiconset
```

- [ ] **Step 2: Create the entry model**

Create `ios/widgets/TimerWidget/TimerWidgetEntry.swift`:

```swift
import WidgetKit

struct TimerWidgetEntry: TimelineEntry {
    let date: Date
    let taskTitle: String?
    let phase: String?
    let status: String?
    let displayTime: String?
    let progress: Double
}
```

- [ ] **Step 3: Create the timeline provider**

Create `ios/widgets/TimerWidget/TimerWidgetProvider.swift`:

```swift
import WidgetKit

struct TimerWidgetProvider: TimelineProvider {
    let suiteName = "group.com.sniper.timeradar"

    func placeholder(in context: Context) -> TimerWidgetEntry {
        TimerWidgetEntry(
            date: Date(),
            taskTitle: "Project Proposal",
            phase: "Focus",
            status: "running",
            displayTime: "20:45",
            progress: 0.17
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (TimerWidgetEntry) -> Void) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TimerWidgetEntry>) -> Void) {
        let entry = readWidgetData()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 5, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func readWidgetData() -> TimerWidgetEntry {
        guard let defaults = UserDefaults(suiteName: suiteName),
              let raw = defaults.string(forKey: "timer-widget-data"),
              let data = raw.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else {
            return TimerWidgetEntry(
                date: Date(),
                taskTitle: nil,
                phase: nil,
                status: nil,
                displayTime: nil,
                progress: 0
            )
        }

        return TimerWidgetEntry(
            date: Date(),
            taskTitle: data["taskTitle"] as? String,
            phase: data["phase"] as? String,
            status: data["status"] as? String,
            displayTime: data["displayTime"] as? String,
            progress: data["progress"] as? Double ?? 0
        )
    }
}
```

- [ ] **Step 4: Create the small widget**

Create `ios/widgets/TimerWidget/SmallTimerWidget.swift`:

```swift
import SwiftUI
import WidgetKit

struct SmallTimerWidgetView: View {
    let entry: TimerWidgetEntry

    var body: some View {
        if let title = entry.taskTitle, let time = entry.displayTime {
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 13, weight: .semibold))
                    .lineLimit(1)
                    .foregroundColor(.primary)

                Spacer()

                Text(time)
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(.accentColor)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(12)
        } else {
            VStack(spacing: 6) {
                Image(systemName: "timer")
                    .font(.system(size: 24))
                    .foregroundColor(.secondary)
                Text("Start a focus session")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding(12)
        }
    }
}

struct SmallTimerWidget: Widget {
    let kind = "SmallTimerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TimerWidgetProvider()) { entry in
            SmallTimerWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Timer")
        .description("Shows your active focus timer.")
        .supportedFamilies([.systemSmall])
    }
}
```

- [ ] **Step 5: Create the medium widget**

Create `ios/widgets/TimerWidget/MediumTimerWidget.swift`:

```swift
import SwiftUI
import WidgetKit

struct MediumTimerWidgetView: View {
    let entry: TimerWidgetEntry

    var body: some View {
        if let title = entry.taskTitle, let time = entry.displayTime, let phase = entry.phase {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(phase)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.secondary)
                        .textCase(.uppercase)

                    Text(title)
                        .font(.system(size: 15, weight: .semibold))
                        .lineLimit(1)
                        .foregroundColor(.primary)

                    Spacer()

                    Text(time)
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundColor(.accentColor)
                }

                Spacer()

                ZStack {
                    Circle()
                        .stroke(Color.secondary.opacity(0.2), lineWidth: 6)

                    Circle()
                        .trim(from: 0, to: entry.progress)
                        .stroke(Color.accentColor, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                        .rotationEffect(.degrees(-90))

                    Image(systemName: entry.status == "paused" ? "pause.fill" : "play.fill")
                        .font(.system(size: 14))
                        .foregroundColor(.accentColor)
                }
                .frame(width: 48, height: 48)
            }
            .padding(14)
        } else {
            VStack(spacing: 8) {
                Image(systemName: "timer")
                    .font(.system(size: 28))
                    .foregroundColor(.secondary)

                Text("No active session")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(14)
        }
    }
}

struct MediumTimerWidget: Widget {
    let kind = "MediumTimerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TimerWidgetProvider()) { entry in
            MediumTimerWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Focus Timer")
        .description("Shows your active timer with progress.")
        .supportedFamilies([.systemMedium])
    }
}
```

- [ ] **Step 6: Create the widget bundle**

Create `ios/widgets/TimerWidget/TimerWidgetBundle.swift`:

```swift
import SwiftUI

@main
struct TimerWidgetBundle: WidgetBundle {
    var body: some Widget {
        SmallTimerWidget()
        MediumTimerWidget()
    }
}
```

- [ ] **Step 7: Create asset catalog**

Create `ios/widgets/TimerWidget/Assets.xcassets/Contents.json`:

```json
{
  "info": {
    "author": "xcode",
    "version": 1
  }
}
```

Create `ios/widgets/TimerWidget/Assets.xcassets/AppIcon.appiconset/Contents.json`:

```json
{
  "images": [],
  "info": {
    "author": "xcode",
    "version": 1
  }
}
```

- [ ] **Step 8: Commit**

```bash
git add ios/widgets/
git commit -m "feat: add iOS WidgetKit extension with small and medium widgets"
```

---

### Task 5: Hook widget sync into timer state changes

**Covers:** [S5, S7]

**Files:**
- Modify: `src/features/focus/hooks.ts`

- [ ] **Step 1: Add widget sync import and calls**

In `src/features/focus/hooks.ts`, add import at the top:

```ts
import { syncTimerToWidget } from '@/src/widgets/widget-sync';
```

Find the `useTimerActions` hook. After each timer operation that changes state, call `syncTimerToWidget`. The timer state is derived from `useActiveTimerSnapshot`. Add a `useEffect` that syncs whenever the snapshot changes.

Add this inside `useTimerActions`, after the snapshot is available:

```ts
useEffect(() => {
  if (snapshot.timer) {
    syncTimerToWidget({
      taskTitle: snapshot.task?.title ?? 'Focus',
      phase: snapshot.timer.phase,
      status: snapshot.timer.status,
      remainingSeconds: snapshot.remainingSeconds,
      plannedSeconds: snapshot.timer.plannedSeconds,
    });
  } else {
    syncTimerToWidget(null);
  }
}, [snapshot]);
```

Also add the `useEffect` import if not already present:

```ts
import { useCallback, useEffect, useMemo, useState } from 'react';
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Run all tests**

```bash
for f in test/*.test.cjs; do node "$f" 2>&1 | grep -E "^# (tests|pass|fail)" | tr '\n' ' ' && echo "[$f]"; done
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/features/focus/hooks.ts
git commit -m "feat: sync timer state to widget on every change"
```

---

### Task 6: Configure deep linking

**Covers:** [S6]

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Register URL scheme**

In `app/_layout.tsx`, add the `useURL` hook from `expo-linking` to handle the `time-radar://` scheme. Expo Router handles URL scheme registration via the `scheme` field in `app.json` (already set in Task 1). No code change is needed in `_layout.tsx` — Expo Router automatically routes `time-radar://` to the home screen.

However, verify the scheme is registered:

```bash
npx expo config --type public 2>&1 | grep scheme
```

Expected: `"scheme": "time-radar"` or similar.

- [ ] **Step 2: Commit**

```bash
git add app/_layout.tsx
git commit -m "chore: verify deep link scheme registration"
```

(Note: if no changes were needed, skip this commit.)

---

### Task 7: Run full verification

**Covers:** [S10]

**Files:** None (verification only)

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run all tests**

```bash
for f in test/*.test.cjs; do node "$f" 2>&1 | grep -E "^# (tests|pass|fail)" | tr '\n' ' ' && echo "[$f]"; done
npx jest src/widgets/__tests__/ --no-cache 2>&1 | tail -5
```

Expected: all tests pass.

- [ ] **Step 3: Verify widget files exist**

```bash
ls -la ios/widgets/TimerWidget/
```

Expected: TimerWidget.swift, TimerWidgetBundle.swift, TimerWidgetEntry.swift, TimerWidgetProvider.swift, SmallTimerWidget.swift, MediumTimerWidget.swift, Assets.xcassets/

- [ ] **Step 4: Verify app.json has widget config**

```bash
grep -A5 "bittingz" app.json
```

Expected: shows the widget plugin configuration.

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A
git status
```

Only commit if there are unstaged changes from fixes.
