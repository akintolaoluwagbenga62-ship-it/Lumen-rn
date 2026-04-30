# Lumen — JAMB Study App

React Native app with Home dashboard, Groups & Chat, CBT practice, Flashcards, Videos, News, and Profile screens.

## Build the Android APK (no setup needed)

1. Create a new public GitHub repo.
2. Upload the **contents** of this folder to the repo (everything except `.github` — drag the rest in).
3. On GitHub, click **Add file → Create new file**, name it `.github/workflows/build-apk.yml`, and paste the contents of `build-apk.yml` from this folder. Commit.
4. Open the **Actions** tab and wait ~10 minutes for the green checkmark.
5. Click into the run → **Summary** → scroll to **Artifacts** → download `lumen-apk`.
6. Unzip → install `app-release.apk` on your Android phone.

## Run locally (optional)

```bash
npm install
npx expo start
```

## Admin

Register with email `admin@lumen.ng` to unlock the admin features in-app.
