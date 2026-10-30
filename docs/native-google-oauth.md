# Native Google OAuth and EAS fingerprints

Use this after web Google login works. Store builds need Android SHA fingerprints and iOS URL schemes registered on the same Google Cloud OAuth client that Supabase uses.

## 1. Create EAS builds

```bash
npm i -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
eas build -p ios --profile preview
```

Bundle IDs in `app.json`:

- Android package: `fit.hbplus.recurrly`
- iOS bundle identifier: `fit.hbplus.recurrly`
- App scheme: `reactnativerecurrly`

## 2. Android SHA-1 / SHA-256

Debug keystore (local emulator):

```bash
npm run fingerprints:android
```

EAS credentials:

```bash
eas credentials -p android
```

Copy **SHA-1** and **SHA-256** into Google Cloud Console → APIs & Services → Credentials → your Android OAuth client.

Also add this intent redirect in Supabase Auth → URL configuration:

- `reactnativerecurrly://auth/callback`

## 3. iOS reversed client ID

Create an iOS OAuth client in Google Cloud with bundle ID `fit.hbplus.recurrly`.

Add the reversed client ID (from the iOS plist, like `com.googleusercontent.apps.xxxxx`) as an iOS URL scheme, then rebuild.

## 4. Supabase Google provider

Paste the Web client ID and secret into Supabase → Authentication → Providers → Google.

Redirect URLs:

- `http://localhost:8081/auth/callback`
- `reactnativerecurrly://auth/callback`
- `https://<your-netlify-site>.netlify.app/auth/callback`
