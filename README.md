# Recurly — Subscription Management App

A cross-platform subscription management application built with **React Native** (Expo) that runs on both **Web** and **Mobile** (Android/iOS). Features **Google OAuth 2.0** authentication with **domain-based access restriction** and a full subscription tracking dashboard.

---

## 🚀 Live Demo

**Deployed on Netlify:** [recurrlysubscription.netlify.app](https://recurrlysubscription.netlify.app)

---

## 📸 Screenshots

| Onboarding | Login | Dashboard | Subscriptions | Insights |
|:---:|:---:|:---:|:---:|:---:|
| Splash screen with branding | Google + Email/Password sign-in | Balance card, upcoming & all subscriptions | Searchable subscription list | Spending chart & history |

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **React Native** (Expo SDK 58) | Cross-platform UI framework |
| **React Native for Web** | Web platform support |
| **Expo Router** | File-based routing with protected routes |
| **Supabase** | Authentication (Google OAuth 2.0) + PostgreSQL database |
| **Zustand** | State management |
| **NativeWind / Tailwind CSS** | Styling |
| **TypeScript** | Type safety |
| **Netlify** | Deployment |

---

## 📦 Setup Instructions

### Prerequisites

- Node.js 20+
- npm or yarn
- A Supabase project ([supabase.com](https://supabase.com))
- Google Cloud OAuth credentials ([console.cloud.google.com](https://console.cloud.google.com))

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/react-native-recurrly.git
cd react-native-recurrly
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key

# Domain restriction:
#   hbplus.fit  → Only @hbplus.fit emails can access
#   *           → All email domains allowed (for testing)
EXPO_PUBLIC_ALLOWED_EMAIL_DOMAIN=hbplus.fit
```

### 4. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project → **APIs & Services** → **OAuth consent screen**
   - Set to **External**
   - Add app name and your email
3. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Add Authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret**

### 5. Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **Providers** → **Google**
3. Toggle **Enable** → paste Client ID and Client Secret → Save

### 6. Run the app

```bash
# Web
npm run web

# Android
npm run android

# iOS
npm run ios
```

---

## 🔐 Authentication Flow

```
User opens app
    │
    ▼
Onboarding Screen → "Get Started"
    │
    ▼
Login Page (Google OAuth button)
    │
    ▼
User clicks "Login with Google"
    │
    ▼
Google OAuth popup → User selects Google account
    │
    ▼
App receives user email from Google
    │
    ▼
Domain Check (lib/domain.ts):
    ├── email = user@hbplus.fit  → ✅ Access GRANTED → Dashboard
    └── email = user@gmail.com   → ❌ Access DENIED → Error message:
                                     "Access restricted. Please login
                                      using your official domain email."
                                     → User signed out automatically
```

### Key Files

| File | Responsibility |
|---|---|
| `lib/auth.tsx` | AuthProvider, Google OAuth, session management, domain enforcement |
| `lib/domain.ts` | Domain validation logic (`isAllowedEmail`) |
| `app/(auth)/sign-in.tsx` | Login page UI |
| `app/auth/callback.tsx` | OAuth callback handler |
| `app/(auth)/_layout.tsx` | Auth route guard (redirects signed-in users) |
| `app/(tabs)/_layout.tsx` | Dashboard route guard (redirects unauthenticated users) |

---

## 🔒 How Domain Restriction Works

The domain restriction is controlled by a single environment variable:

```env
EXPO_PUBLIC_ALLOWED_EMAIL_DOMAIN=hbplus.fit
```

### Logic (in `lib/domain.ts`):

```typescript
export function isAllowedEmail(email?: string | null) {
  if (!email) return false;
  const domain = getAllowedEmailDomain();   // reads from env
  if (!domain || domain === '*') return true;  // allow all if wildcard
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf('@');
  return normalized.slice(at + 1) === domain;  // check domain match
}
```

### Enforcement Points:

1. **Post-login check** (`lib/auth.tsx` → `applySession()`): After Google sign-in, the user's email domain is verified. If it doesn't match, the session is destroyed and an error is shown.

2. **Route protection** (`app/(tabs)/_layout.tsx`): The dashboard checks `isSignedIn` (which itself checks `isAllowedEmail`). Unauthenticated or domain-restricted users are redirected to the login page.

3. **No direct URL access**: Even if someone navigates directly to `/` or `/(tabs)`, the route guards redirect them to sign-in if not authenticated.

### Testing Domain Restriction:

| `.env` / Netlify Value | Access Behavior | Assignment Context |
|---|---|---|
| `hbplus.fit` | Only `@hbplus.fit` emails allowed | **Default for Assignment:** `@hbplus.fit` emails are granted access. Personal emails (`@gmail.com`, etc.) are blocked with access restriction error. |
| `*` | All email domains allowed | Open testing mode (allows `@gmail.com` and other domains for general evaluation). |

---

## 🛡 Security Features

- **Protected routes**: Dashboard pages are inaccessible without authentication. Route guards in layouts redirect unauthenticated users.
- **Token handling**: Supabase PKCE auth flow with automatic token refresh. Sessions stored securely (AsyncStorage on mobile, browser storage on web).
- **State management**: Auth state managed via React Context + Zustand store for subscriptions.
- **Domain enforcement**: Post-authentication domain check ensures only authorized emails access the app, regardless of OAuth provider.

---

## ⭐ Bonus Features Implemented

- **Role-based access (Admin / User)**: User roles stored in `profiles` table. Admin users see an extra Admin tab with management capabilities.
- **User data stored in database**: Profiles automatically upserted to Supabase `profiles` table on sign-in. Subscriptions stored in `subscriptions` table.
- **Route protection**: Both auth and tab layouts enforce access control via redirects.
- **Responsive design**: Sidebar navigation on wide screens, bottom tab bar on mobile.
- **Subscription management**: Full CRUD with create modal, cancel functionality, and search.
- **Analytics**: PostHog integration for event tracking.

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx          # Auth route guard
│   │   └── sign-in.tsx          # Login page
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Dashboard route guard + tab bar
│   │   ├── index.tsx            # Home / Dashboard
│   │   ├── subscriptions.tsx    # Searchable subscription list
│   │   ├── insights.tsx         # Monthly spending insights
│   │   ├── settings.tsx         # Profile & sign out
│   │   └── admin.tsx            # Admin panel (role-based)
│   ├── auth/
│   │   └── callback.tsx         # OAuth callback handler
│   ├── subscriptions/
│   │   └── [id].tsx             # Subscription detail page
│   ├── onboarding.tsx           # Welcome / splash screen
│   ├── index.tsx                # Root redirect
│   └── _layout.tsx              # Root layout with AuthProvider
├── lib/
│   ├── auth.tsx                 # Auth context, Google OAuth, email auth
│   ├── domain.ts                # Domain restriction logic
│   ├── supabase.ts              # Supabase client configuration
│   ├── subscriptionStore.ts     # Zustand store for subscriptions
│   ├── subscriptionMapper.ts    # DB row ↔ app model mapper
│   ├── analytics.ts             # PostHog analytics
│   ├── useAdmin.ts              # Admin role hook
│   └── utils.ts                 # Formatting utilities
├── components/
│   ├── CreateSubscriptionModal.tsx
│   ├── SubscriptionCard.tsx
│   ├── UpcomingSubscriptionCard.tsx
│   ├── ListHeading.tsx
│   ├── SpendChart.tsx
│   └── PageShell.tsx
├── constants/
│   ├── data.ts                  # Dummy data & tab config
│   ├── icons.ts                 # Icon imports
│   ├── images.ts                # Image imports
│   └── theme.ts                 # Colors, spacing, component tokens
├── .env                         # Environment variables (not committed)
├── .env.example                 # Example env template
├── netlify.toml                 # Netlify deployment config
├── metro.config.js              # Metro bundler + NativeWind config
└── package.json
```

---

## 🌐 Deployment (Netlify)

The project includes a `netlify.toml` for one-click deployment. See the deployment section below or visit the live demo link above.

```bash
# Build command (configured in netlify.toml)
npx expo export --platform web

# Output directory
dist/
```

---

## 📌 Note for Evaluators

- **Allowed Access:** Any Google account ending in **`@hbplus.fit`** is granted full access to the Dashboard and Admin features.
- **Blocked Access:** Any standard personal email (such as **`@gmail.com`**, `@yahoo.com`, etc.) is blocked with the error message:
  > *"Access restricted. Please login using your official domain email."*
- **Environment Configuration:** Domain validation is governed by the `EXPO_PUBLIC_ALLOWED_EMAIL_DOMAIN` environment variable. On production/Netlify, setting this to `hbplus.fit` enforces company-only access, while `*` can be used to permit all domains for open testing.

---

## 📄 License

MIT License — Personal Project.
