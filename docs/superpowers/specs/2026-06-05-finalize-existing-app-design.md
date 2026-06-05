# Finalize Existing App Design

Date: 2026-06-05
Project: TimeRadar
Status: Approved scope, ready for implementation planning

## Goal

Finalize the current TimeRadar app without adding new product features. The work should make the existing focus timer, tasks, stats, onboarding, settings, SQLite persistence, notifications, and visual system feel more production-ready.

The pass should improve code quality, runtime reliability, performance, accessibility, and UI polish while preserving the current product shape.

## Non-Goals

- Do not add new tabs, planning flows, analytics concepts, AI helpers, scheduling systems, or advanced user workflows.
- Do not redesign the app from scratch.
- Do not change the Poppins typography direction.
- Do not replace Expo Router, SQLite, or the existing focus-domain model.
- Do not commit generated test build output.

## Product Direction

TimeRadar remains a simple focus companion:

- Home: start or control a focus session and see the current progress summary.
- Tasks: manage saved focus tasks.
- Stats: understand focus time and distribution.
- Settings: tune timer defaults, notifications, haptics, and completion behavior.

The finalization pass should make those existing flows clearer, more reliable, and easier to maintain rather than making the app broader.

## Architecture

Keep route files focused on screen composition. Move domain-heavy logic into `src/features/focus` where it can be reused and tested.

Priority areas:

- Split oversized focus hooks or helpers only when a smaller module improves clarity.
- Keep SQLite access in repository/database modules.
- Keep timer transition rules pure and testable.
- Keep shared UI primitives in `src/components`.
- Preserve path aliases and Expo Router file-based routes.

The implementation should prefer small, targeted refactors over a sweeping rewrite.

## Performance

Measure and fix practical performance issues that matter for this app:

- Avoid unnecessary route and timer re-renders.
- Memoize derived values where they are repeatedly computed across renders.
- Keep timer interval work narrow and predictable.
- Avoid expensive list or chart work inside render when it can be derived once.
- Keep asset/font loading aligned with Expo SDK 54 best practices.

Performance work should be evidence-based: run the existing checks before and after, and use manual smoke testing for timer responsiveness.

## Accessibility And UX Quality

Improve the current UI without changing the feature set:

- Add missing accessibility labels, roles, states, and disabled semantics to interactive controls.
- Ensure important data text can be selected where appropriate.
- Improve empty states and validation feedback only where the existing flows are unclear.
- Keep touch targets comfortably usable on mobile.
- Preserve the current warm, minimal visual direction and Poppins typography.
- Tighten spacing and component consistency where the existing UI already points.

## Data And Reliability

SQLite and timer behavior are the main reliability surface.

The hardening pass should check:

- Database migrations are idempotent.
- Settings reads have safe fallbacks.
- Timer reset, pause, resume, and completion paths remain consistent.
- Notifications sync correctly when timer or settings state changes.
- Invalid or missing task references fail gracefully.

Any database change must use an explicit user-version migration and preserve existing data.

## Testing

Add tests where risk is real, not just for coverage volume.

Required verification targets:

- Existing tests continue to pass.
- TypeScript compilation passes.
- Expo lint passes.
- Timer/session rule tests cover any changed pure logic.
- Repository or hook-adjacent logic gets focused tests when it is extracted into pure modules.
- `git diff --check` passes.

Manual smoke checks:

- Onboarding route enters the tab app.
- Home timer can start, pause, resume, reset, and complete.
- Task creation and editing still work.
- Stats screen renders after session changes.
- Settings changes persist and do not break timer notifications.

## Implementation Boundaries

This is one release-readiness slice. The work is complete when the existing app is cleaner, safer, and verified, not when every possible future refactor is finished.

If a refactor reveals a larger architectural issue, document it as follow-up unless it directly blocks the current app from working correctly.
