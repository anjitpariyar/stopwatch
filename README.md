# Unlocked

Counts how many times you unlock your phone and shows the number on your home screen.

- **Widgets:** Unlocked (2×2), Unlocked · Week (4×2 with a 7-day chart), Unlocked · Bar (4×1)
- **App:** today's ring against your daily average, plus day, week, month and year history
- **Private:** data stays on the device, no account, no ads

Android 9+ only. Unlock events come from `UsageStatsManager` (`KEYGUARD_HIDDEN`), read by the local
Expo module in `modules/unlock-counter`. The user grants **Usage access** once.

## Scripts

| Script | What it does |
| --- | --- |
| `npm start` | Expo dev server (needs a dev client build; the native module isn't in Expo Go) |
| `npm run typecheck` | TypeScript check |
| `npm run assets` | Regenerate icons, splash, widget previews and store graphics from `scripts/generate-assets.js` (needs `rsvg-convert`) |
| `npm run prebuild:android` | Regenerate `android/` after changing `app.json` or native code |
| `npm run build:apk:local` | Release APK on this machine (JDK 17 in `JAVA_HOME`) |
| `npm run build:apk` | EAS APK for sideloading/testing |
| `npm run build:dev` | EAS development client |
| `npm run build:store` | EAS `.aab` for Google Play |
| `npm run submit:store` | Upload the latest store build to Play's internal track as a draft |

## Store

The listing copy, Play Console answers and privacy policy are in `store/`.
