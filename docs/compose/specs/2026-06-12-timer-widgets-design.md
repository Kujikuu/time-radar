# Timer Widgets Design

Date: 2026-06-12
Project: TimeRadar
Status: Approved

## [S1] Problem

Users must open the app to check their active timer status. A home screen widget would let them glance at the countdown without unlocking their phone.

## [S2] Solution overview

Add iOS WidgetKit widgets (Small and Medium) that display the currently active focus timer. The small widget shows the task name and countdown. The medium widget adds a phase label and progress ring. Tapping either widget opens the app.

## [S3] Small widget

Displays:
- Task name (single line, truncated with ellipsis)
- Countdown in `MM:SS` format
- When no timer is active: "Start a focus session" placeholder with radar icon

Tap behavior: Opens app to home screen.

## [S4] Medium widget

Displays:
- Task name
- Phase label (Focus / Short Break / Long Break)
- Countdown in `MM:SS` format
- Circular progress ring showing elapsed vs planned time
- When no timer is active: "No active session" with "Open" button

Tap behavior: Opens app to home screen.

## [S5] Data sync architecture

Widget data flows from the app to the iOS widget extension via App Groups shared UserDefaults.

Sync triggers:
- Timer starts
- Timer pauses
- Timer resumes
- Timer resets or completes
- Timer phase transitions (focus -> break)

Data format (JSON in UserDefaults key `timer-widget-data`):
```json
{
  "taskTitle": "Project Proposal",
  "phase": "focus",
  "status": "running",
  "remainingSeconds": 1245,
  "plannedSeconds": 1500,
  "updatedAt": "2026-06-12T10:30:00Z"
}
```

When no timer is active, the key is removed or set to null.

## [S6] Deep linking

Widget tap opens the app via URL scheme `time-radar://`. Expo Router handles the scheme. No specific route needed — tapping opens the home screen where the timer is visible.

## [S7] Refresh strategy

- Widget timeline: refresh every 5 minutes as fallback
- Widget reloads immediately when app writes new data to shared UserDefaults
- Widget uses `TimelineProvider` that reads from UserDefaults and returns a single entry with the current data + a 5-minute refresh date

## [S8] Platform scope

iOS only for initial release. Android widgets can be added later using Jetpack Glance. No Android work in this spec.

## [S9] Files

- Create: `src/widgets/timer-widget-data.ts` — types and formatting for widget data
- Create: `src/widgets/widget-sync.ts` — write timer state to shared UserDefaults via expo-widget
- Modify: `app.json` — add expo-widget plugin, URL scheme, App Groups entitlement
- Modify: `app/_layout.tsx` — register URL scheme handler
- Modify: `src/features/focus/repository.ts` — call widget sync on timer state changes
- WidgetKit extension files (scaffolded by expo-widget CLI)

## [S10] Testing

- Unit tests for timer-widget-data formatting functions
- Manual verification: widget appears on home screen, updates when timer starts/pauses/stops
- Manual verification: tapping widget opens app
- TypeScript compiles cleanly
- All existing tests pass
