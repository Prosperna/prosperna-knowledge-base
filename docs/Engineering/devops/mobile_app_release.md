---
id: mobile-app-release
title: Mobile App Release Process
sidebar_label: Mobile App Release
---

# Mobile App Release Process

This guide outlines how we build, test, and release the **Prosperna Mobile App** to the **Google Play Store** and **Apple App Store**. We support three environments: `dev`, `staging`, and `production`, and use Datadog RUM for observability.

---

## Observability with Datadog RUM

We use [Datadog Real User Monitoring (RUM)](https://www.datadoghq.com/product/rum/) to monitor frontend performance and user behavior across all mobile environments:

- `dev` → Dev RUM application ID
- `staging` → Staging RUM application ID
- `production` → Production RUM application ID

Ensure RUM tokens are correctly injected via environment variables or secrets in each CI/CD pipeline and Flutter environment configuration.

---

## Android Deployment (Play Store)

We use **GitHub Actions** to automate Android deployments via separate workflows for each environment:

### Branch-to-Track Mapping

| Branch    | Play Store Track |
| --------- | ---------------- |
| `dev`     | Internal Testing |
| `staging` | Closed Alpha     |
| `main`    | Production       |

> Each branch has its own dedicated GitHub Actions workflow file.

### Dev Branch CI/CD Highlights

- Triggers on push to `dev`
- Runs unit, widget, integration tests
- Builds APK and AAB
- Deploys AAB to **Internal Testing** track via Play Store API
- Uploads artifacts to GitHub
- Sends Lark webhook notifications
- Fetches and increments version from `version.json`
- Uses AWS S3, Secrets Manager, and `jq` for automation

📦 Refer to the GitHub repo: [p1-mobile-app](https://github.com/Prosperna/p1-mobile-app)

### Production Release Reminder

When releasing to the **Production track**, always review the [Play Store Publishing Overview](https://play.google.com/console/u/0/developers/4827462962886244684/app/4974541765238292064/publishing) for any pending issues or approvals. Publishing can take time due to Google’s review process.

---

## iOS Deployment (App Store)

Currently, iOS deployment is **manual** via Xcode but follows structured environments:

| Branch        | Purpose     |
| ------------- | ----------- |
| `dev-ios`     | Development |
| `staging-ios` | Staging     |
| `main-ios`    | Production  |

### Manual Deployment Steps

1. Clone repo: `git clone git@github.com:Prosperna/p1-mobile-app.git`
2. Checkout appropriate branch: `git checkout main-ios`
3. Pull latest changes
4. `flutter clean`
5. `flutter pub get`
6. `cd ios && pod install --repo-update`
7. Open `Runner.xcworkspace` in Xcode
8. Clean build folder from Product menu
9. Update Bundle Identifier:
   - `com.prosperna.p1-mobile-dev`
   - `com.prosperna.p1-mobile-staging`
   - `com.prosperna.p1-mobile-app`
10. Archive build via Product > Archive
11. Distribute via TestFlight using Organizer
12. Follow export compliance prompts
13. Confirm availability in App Store Connect
14. Assign testers (internal/external)

### Apple Developer Access

We have only **one Apple Developer account**. If you need 2FA or OTP for login, please contact **Boss Dennis Velasco**.

### App Review Reminder

For App Store deployments, always check the **App Review** status in App Store Connect. Apple reviews take time and may delay availability.

---

## Prosperna App Testing Instructions

### Closed Alpha Track

**Join Instructions:**

1. **Android:**

   - [Install the app](https://play.google.com/store/apps/details?id=com.p1.mobile)

2. **Web:**

   - [Join Alpha Track](https://play.google.com/apps/testing/com.p1.mobile)
   - Click on "Become a tester"

> Ensure that you are logged in with your **prosperna.com** email address to access the Alpha track.

### Internal Testing Track

**Join Instructions:**

1. **Web:**
   - [Join Internal Track](https://play.google.com/apps/internaltest/4701633551516340069)
   - Click on "Become a tester"

> Ensure that you are logged in with your **prosperna.com** email address to access the Internal track.

### Production Release Access

**Recommendation:** Use your **personal email address** to access the Play Store production release. This avoids conflicts with internal testing accounts.

### Uninstall Instructions (Before Switching Tracks)

Before installing the Prosperna app for a different track:

1. Go to device **Settings**
2. Select **Apps** or **Application Manager**
3. Find and select **Prosperna app**
4. Tap **Uninstall** and confirm

---

## Versioning, Release Notes & Rollbacks

### Versioning

We manage app versions using `version.json` stored in S3:

```json
{
  "versionCode": 120,
  "versionName": "1.2.0"
}
```

- CI pipeline fetches and increments `versionCode`
- `versionName` comes from latest GitHub release tag
- Versions are injected into `build.gradle` and App Store metadata

### Release Notes

- Each release must be tagged on GitHub with detailed notes
- Play Store release notes are uploaded via GitHub Action
- App Store notes are added manually or via TestFlight metadata

### ↩️ Rollbacks

- For Android, revert to a previous version and re-upload (must increase `versionCode`)
- For iOS, unpublish and re-submit using a patched version

> 💡 Keep prior versions archived and tagged for quick rollback access.

---

## Future: App Store CI/CD Plan

We plan to implement GitHub Actions for iOS CI/CD. Goals include:

- Automate builds via `macos-latest` GitHub runners or [EAS Build](https://docs.expo.dev/build/introduction/)
- Integrate with TestFlight via Fastlane
- Auto-increment versions using GitHub releases
- Inject env via AWS Secrets Manager
- Add Lark notifications for deployment status

---

## ✅ Summary

- Android CI/CD is automated per environment using GitHub Actions
- iOS is deployed manually, with structured branch mapping
- App versioning and notes are tightly integrated with GitHub
- Datadog RUM is enabled for observability across all builds
- Reviews by Google and Apple take time and should be monitored during release
- Apple Developer account access is centralized, contact Boss Dennis for 2FA access
- Testing instructions are provided for Alpha, Internal, and Production releases

> 🚀 Release with confidence. Monitor with precision. Tag responsibly.

