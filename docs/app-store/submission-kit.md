# TimeRadar App Store Submission Kit

Prepared for build `1.0.1` (`2`) / EAS build `69f48505-249f-4699-8097-da56ee5adf09`.

## Screenshot Uploads

Upload the final Arabic PNGs from `docs/app-store/screenshots/final`.

Language-specific screenshots are also available here:

- Arabic: `docs/app-store/screenshots/final/ar`
- English: `docs/app-store/screenshots/final/en`

Raw captures are kept here:

- Arabic: `docs/app-store/screenshots/raw/ar`
- English: `docs/app-store/screenshots/raw/en`

### iPhone 6.5" / 6.7" Display

Apple-accepted portrait size used here: `1284 x 2778`.

Also accepted by App Store Connect for this slot: `1242 x 2688`, `2688 x 1242`, and `2778 x 1284`.

1. `iphone-01-home.png` - Home, radar signal, timer.
2. `iphone-02-tasks.png` - Task queue.
3. `iphone-03-stats.png` - Stats.
4. `iphone-04-support.png` - Supporter Pack purchase surface.
5. `iphone-05-settings.png` - Settings, notifications, language.

### iPad 13" Display

Apple-accepted size: `2048 x 2732`.

1. `ipad-01-home.png`
2. `ipad-02-tasks.png`
3. `ipad-03-stats.png`
4. `ipad-04-support.png`
5. `ipad-05-settings.png`

Use the matching filenames inside `final/ar` and `final/en` when uploading separate Arabic and English localizations in App Store Connect. The top-level `final` folder mirrors the Arabic set for the primary language.

## App Information

Primary language: Arabic.

Bundle ID: `com.afifistudio.timeradar`.

SKU: `com.afifistudio.timeradar`.

Category:
- Primary: Productivity
- Secondary: Education

Pricing: Free.

Contains in-app purchases: Yes.

## Arabic Metadata

Name: `TimeRadar - رادار التركيز`

Subtitle: `تركيز مهني بلا تشتيت`

Keywords:

```text
تركيز,مؤقت,بومودورو,إنتاجية,عمل,دراسة,مهام,إنجاز,وقت,تنبيه,إحصائيات,مهني,سعودي
```

Promotional text:

```text
ابدأ جلسة تركيز خلال ثوان، وتابع تقدمك اليومي بإشارة رادار بسيطة.
```

Description:

```text
TimeRadar يساعدك على تحويل وقت العمل إلى جلسات تركيز واضحة وهادئة. افتح التطبيق، ابدأ جلسة تركيز سريعة، واترك المؤقت والتنبيهات والإحصائيات الخفيفة تساعدك على حماية وقتك وإنجاز أعمالك اليومية.

ماذا يقدم لك TimeRadar؟

- جلسة تركيز سريعة بضغطة واحدة
- مؤقت تركيز مع استراحات قصيرة وطويلة
- إشارة رادار يومية تقيس ثبات تركيزك
- إحصائيات بسيطة لليوم والأسبوع والشهر والسنة
- تجربة عربية وإنجليزية مع دعم RTL
- مهام تركيز محفوظة على جهازك
- حزمة داعم اختيارية لا تغيّر مجانية التطبيق

يبقى TimeRadar مجانيًا دائمًا. حزمة الداعم الاختيارية بقيمة 1.99 دولار تدعم المطوّر وتفتح مظهرًا بصريًا أدفأ، بدون قفل أي ميزة أساسية.

ابدأ جلسة التركيز التالية بهدوء.
```

What's New:

```text
الإصدار 1.0.1 يجهز TimeRadar للإطلاق على iOS مع تحسين تجربة السحب لحذف المهام في الواجهة العربية، وثبات أفضل لتجربة RTL.
```

## English Metadata

Name: `TimeRadar`

Subtitle: `Professional focus timer`

Keywords:

```text
focus,timer,pomodoro,productivity,work,study,tasks,habits,deepwork,stats,arabic,saudi
```

Promotional text:

```text
Start a focus block in seconds and review calm daily progress.
```

Description:

```text
TimeRadar is a focused work timer for professionals who want less setup and more execution. Start a quick focus block, follow a simple focus/break rhythm, and see your daily radar signal grow as you complete focused work.

What TimeRadar gives you:

- One-tap quick focus block
- Focus timer with planned breaks
- Daily radar signal for visible momentum
- Lightweight progress stats
- Arabic-first experience with English support
- Local task and session history stored on your device
- Optional Supporter Pack without locked productivity features

TimeRadar stays free forever. The optional $1.99 Supporter Pack supports the developer and unlocks a warmer visual theme as a small thank-you; all core focus features remain free.

Open TimeRadar and start the next focused block.
```

What's New:

```text
Version 1.0.1 prepares TimeRadar for iOS release with a more stable Arabic/RTL task swipe experience and release-ready polish.
```

## App Review Information

Sign-in required: No.

Demo account: Not needed.

Review notes:

```text
TimeRadar does not require an account or external backend.

Core flow:
1. Open the app.
2. Complete or skip onboarding.
3. Tap Start Focus on the home timer.
4. Use Tasks to view seeded focus tasks or create a task.
5. Use Stats to view local progress.
6. Use Settings to switch Arabic/English and configure local timer alerts.

The optional Supporter Pack is a one-time non-consumable in-app purchase with product ID supporter_pack_199. All core focus features remain free.
```

Contact:
- First name: Ahmed
- Last name: Afifi
- Email: radar@afifistudio.com
- Phone: TODO

URLs:
- Privacy Policy URL: TODO public URL for `docs/app-store/privacy-policy.md`
- Support URL: TODO public support/contact URL
- Marketing URL: Optional

## App Privacy Answers

Recommended App Store Connect answer: `Data Not Collected`.

Reasoning:
- Focus tasks, settings, timer state, and session stats are stored locally on device with SQLite.
- No account system.
- No advertising SDK.
- No analytics SDK.
- No tracking across apps or websites.
- Local notifications are scheduled on device.
- Supporter Pack is processed through Apple's in-app purchase system; TimeRadar does not send purchase receipts or personal identifiers to a developer server.

Tracking: `No`.

Does the app use third-party data for tracking or advertising measurement? `No`.

Does the app collect diagnostics? `No`, unless you later add a crash/analytics service.

Does the app collect user content? `No`; task titles are local-only and are not transmitted off device.

Does the app collect purchase history? `No`; the app only stores a local entitlement flag on device.

## Age Rating

Suggested rating: `4+`.

Answer all content categories as `None`, including:
- Violence
- Sexual content or nudity
- Profanity
- Alcohol, tobacco, or drug references
- Medical/treatment information
- Horror/fear themes
- Gambling or simulated gambling
- Contests
- Unrestricted web access

Made for Kids: `No`.

## Export Compliance

The app config declares:

```json
"usesNonExemptEncryption": false
```

Recommended answer: no non-exempt encryption. The app does not implement custom encryption.

## Final Submit Checklist

1. Create/select the App Store Connect app for bundle ID `com.afifistudio.timeradar`.
2. Add the `1.0.1` app version.
3. Upload screenshots from `docs/app-store/screenshots/final`.
4. Paste Arabic and English metadata.
5. Add Privacy Policy URL and Support URL.
6. Complete App Privacy as `Data Not Collected`.
7. Complete Age Rating as `4+`.
8. Configure the non-consumable IAP `supporter_pack_199`.
9. Attach the IAP to this first app version before review.
10. Select build `1.0.1 (2)` after it appears from TestFlight/App Store Connect processing.
11. Submit for App Review.
