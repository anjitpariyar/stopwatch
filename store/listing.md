# Unlocked: Play Store listing

## App name (30 max)
Unlocked: Phone Unlock Counter

## Short description (80 max)
See how often you reach for your phone. A widget that counts every unlock.

## Full description (4000 max)
How many times did you unlock your phone today? Most people guess 30. The real number is often 80 or more.

Unlocked puts that number on your home screen, so every time you pick up your phone you see the count go up. No timers, no blocking, no nagging. Just an honest number that quietly changes your habits.

WIDGETS FIRST
• Unlocked: a small 2×2 tile with today's count and your daily average
• Unlocked · Week: today's count next to a 7-day bar chart
• Unlocked · Bar: a slim one-line counter that fits anywhere

FULL HISTORY
Open the app to see every day you've tracked, then switch to weekly, monthly and yearly totals. Each period shows its per-day average, so you can tell whether this month was better than the last.

THE RING
Today's unlocks are shown as a ring that fills up toward your daily average. Stay green and you're below it. Turn yellow and you're picking up your phone more than usual.

ACCURATE, EVEN WHEN CLOSED
Unlocked reads the unlock events Android already records (the same source Digital Wellbeing uses). It doesn't need to run in the background, shows no permanent notification, and doesn't drain your battery. When you first open it, it fills in about the past week automatically.

PRIVATE BY DESIGN
• No account, no sign-up
• No ads, no analytics, no tracking
• Your history is stored only on your phone and never uploaded

Unlocked needs one permission, Usage access, which you turn on once in Android settings. It's only used to count unlocks.

Requires Android 9 or newer.

## Category
Productivity (alt: Lifestyle)

## Tags / keywords
screen time, phone addiction, digital wellbeing, unlock counter, pickups, habit tracker, widget

## Graphics
- App icon 512×512: `store/icon-512.png`
- Feature graphic 1024×500: `store/feature-graphic.png`
- Phone screenshots 1080×1920: `store/screenshots/01-widget.png`, `store/screenshots/02-app.png`
  (raw captures in `store/screenshots/raw/`; add more there, list them in `SHOTS` in
  `scripts/generate-assets.js`, then run `npm run assets`)

## Release notes: 1.0.0
First release. Count your phone unlocks with three home-screen widgets and day, week, month and year history.

---

## Play Console: App content answers

**Privacy policy URL:** https://github.com/anjitpariyar/stopwatch/blob/test/store/privacy-policy.md
(served from the public repo; if you merge to `main`, switch `test` to `main` in this link)

**Package name:** `com.limbo_anj.unlocked` (permanent once uploaded)
**Support email:** anjitcoder@gmail.com

**Data safety**
- Does your app collect or share any of the required user data types? **No**
- Data is processed only on the device and is never transmitted.

**Ads:** No · **Target audience:** 18+ (or 13+) · **Content rating:** Everyone (no user content, no violence)

**Sensitive permission: `PACKAGE_USAGE_STATS` (Usage access)**
Explain in the review notes, if asked:
> The app's only feature is counting how many times the user unlocks their device. It reads KEYGUARD_HIDDEN events from UsageStatsManager to get that count. The user grants access from an in-app screen that explains why it is needed. The data is stored only on the device and never transmitted.
