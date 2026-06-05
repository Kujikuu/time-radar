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
