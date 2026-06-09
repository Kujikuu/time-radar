# TimeRadar Native In-App Purchase Setup

## Product

Type: Non-consumable on App Store Connect; one-time product on Google Play Console.

Product ID:

```text
supporter_pack_199
```

Reference name:

```text
TimeRadar Supporter Pack
```

Price:

```text
USD 1.99
```

## Arabic Localization

Display name:

```text
حزمة الداعم
```

Description:

```text
ادعم تطوير TimeRadar وافتح مظهرًا بصريًا أدفأ. كل مزايا التركيز الأساسية تبقى مجانية.
```

## English Localization

Display name:

```text
Supporter Pack
```

Description:

```text
Support TimeRadar development and unlock a warmer visual theme. All core focus features stay free.
```

## Review Screenshot

Use:

```text
docs/app-store/screenshots/final/iphone-04-support.png
```

## Review Notes

```text
Open the app, complete or skip onboarding, then go to Stats or Settings. The Supporter Pack card shows the non-consumable purchase and Restore Purchase action. The product ID used in the app is supporter_pack_199.
```

## App Store Connect Setup

1. Create a non-consumable in-app purchase.
2. Use product ID `supporter_pack_199`.
3. Set the reference name to `TimeRadar Supporter Pack`.
4. Add the English and Arabic localization text above.
5. Set the price tier to USD 1.99 or the closest local equivalent.
6. Attach the purchase to the first app version before submitting the app for review.

## Google Play Console Setup

1. Create a one-time product.
2. Use product ID `supporter_pack_199`.
3. Set the name to `Supporter Pack` in English and `حزمة الداعم` in Arabic.
4. Use the matching English and Arabic descriptions above.
5. Set the base price to USD 1.99 or the closest local equivalent.
6. Activate the product after Google Play Console requirements are complete.

## First Submission Rule

For the first in-app purchase, App Store Connect must show the product as Ready to Submit, and it must be attached to the new app version before submitting the app for review.
