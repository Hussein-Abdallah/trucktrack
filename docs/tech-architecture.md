# TruckTrack — Technical Architecture

> Full stack overview, monorepo structure, Supabase schema, environment variables, GitHub workflow, and CI/CD pipeline. Version 1.0 · 2026

---

TruckTrack · Technical Architecture · v1.0

# TECH

STACK

The definitive reference for every tool, service, and architectural decision in the TruckTrack platform. If you're setting up the project for the first time or returning after a break — start here.

FrameworkReact Native · Expo SDK 54

LanguageTypeScript (strict)

BackendSupabase

Version1.0 — Draft

01 — Stack Overview

## FULL STACK AT A GLANCE

Every tool in the TruckTrack platform, its cost tier, and its role. Ordered by layer — from the device down to infrastructure.

| Category                 | Tool                         | Cost         | Role                                                             |
| ------------------------ | ---------------------------- | ------------ | ---------------------------------------------------------------- |
| **Source Control**       | `GitHub`                     | Free         | Code repository, issues, pull requests, Actions CI               |
| **Project Tracking**     | `Plane`                      | Free         | Kanban board, sprints (cycles), epics (modules), MCP integration |
| **Framework**            | `Expo SDK 54 + React Native` | Free         | iOS & Android from one codebase                                  |
| **Language**             | `TypeScript (strict)`        | Free         | Type safety across the entire codebase                           |
| **UI Library**           | `Gluestack UI v3`            | Free         | Accessible component system, Street Fire themed                  |
| **Navigation**           | `Expo Router v4`             | Free         | File-system routing (like Next.js, for mobile)                   |
| **State Management**     | `Zustand`                    | Free         | Lightweight global state (auth, user preferences)                |
| **Data Fetching**        | `TanStack Query v5`          | Free         | Server state, caching, background refetch                        |
| **Backend / DB**         | `Supabase`                   | Free tier    | Postgres DB, Auth, real-time subscriptions, storage              |
| **Maps**                 | `Mapbox`                     | Free tier    | Dark-mode map, custom truck pins, location search                |
| **Push Notifications**   | `Expo Notifications`         | Free         | iOS & Android push from one API                                  |
| **Payments**             | `Stripe`                     | % of revenue | Operator subscriptions, catering deposits                        |
| **Error Tracking**       | `Sentry`                     | Free tier    | Crash reports, error traces in production                        |
| **Analytics**            | `PostHog`                    | Free tier    | Product analytics, funnel tracking, feature flags                |
| **Builds**               | `EAS Build`                  | Free tier    | Cloud builds for iOS & Android — no Mac needed                   |
| **OTA Updates**          | `EAS Update`                 | Free tier    | Push JS fixes without App Store review                           |
| **iOS Distribution**     | `Apple Developer`            | $99/year     | Required for App Store submission                                |
| **Android Distribution** | `Google Play`                | $25 one-time | Required for Play Store submission                               |
| **Design**               | `Figma`                      | Free tier    | UI design, component specs, handoff                              |

**Total upfront cost to ship MVP:** $124 USD — $99 Apple Developer + $25 Google Play. Everything else runs free until revenue is flowing.

02 — Tool Details

## TOOLS & SERVICES

Why each tool was chosen and what it covers. Links and account info should be added as you set each one up.

### Core Platform

📱

Expo SDK 54

expo.dev · SDK 54 / React Native 0.76

Core

The foundation. Expo wraps React Native with a batteries-included toolchain — unified APIs for camera, GPS, notifications, and storage. EAS handles cloud builds and OTA updates.

**Why:** No Mac needed for iOS builds. One codebase for iOS and Android. The New Architecture (Fabric + JSI) ships by default in SDK 54, giving near-native performance.

🗄️

Supabase

supabase.com · Postgres + Auth + Realtime

Free Tier

The entire backend — database (Postgres), authentication (email, OAuth), real-time subscriptions, file storage, and auto-generated REST + GraphQL APIs.

**Why:** Real-time truck location updates are a native Supabase use case via Postgres LISTEN/NOTIFY. Free tier covers the full MVP. Row Level Security handles operator data isolation without custom auth middleware.

🗺️

Mapbox

mapbox.com · Maps SDK for React Native

Free Tier

Custom map rendering for the consumer home screen. Supports fully custom dark-mode map styles, custom SVG pin markers, and geocoding for operator location search.

**Why over Google Maps:** Mapbox allows fully custom map styles — essential for matching the Street Fire dark palette. The free tier (50,000 map loads/month) covers early growth comfortably.

💳

Stripe

stripe.com · Billing + Payment Links

% of Revenue

Handles operator subscription billing (Starter $19/mo, Pro $39/mo, Festival $79/mo) and catering deposit collection. Stripe Customer Portal lets operators self-manage billing.

**Why:** Best-in-class React Native SDK. Stripe Billing handles free trials, upgrades, downgrades, and winter pause (subscription pausing) natively. 2.9% + 30¢ per transaction — no upfront cost.

🔔

Expo Notifications

docs.expo.dev/push-notifications

Free

Push notification delivery to iOS (APNs) and Android (FCM) from a single unified API. Handles tokens, scheduling, and delivery receipts.

**Why:** Already in the Expo SDK — zero extra setup. The "truck opened near you" notification is the #1 retention mechanic. Per-truck granular notification controls are built on top of this.

🐛

Sentry

sentry.io · React Native SDK

Free Tier

Catches runtime errors and crashes in production with full stack traces, device info, and breadcrumbs (the user actions that led to the crash).

**Why:** Without this, production bugs are invisible until a user complains in an App Store review. Free tier gives 5,000 errors/month — more than enough for MVP.

📊

PostHog

posthog.com · Open Source Analytics

Free Tier

Product analytics — track which screens users visit, where they drop off, how many follow a truck after viewing its profile. Also handles feature flags for gradual rollouts.

**Why:** Open source, self-hostable, 1M events/month free. Feature flags let you roll out the catering feature to Pro users only without a new app release.

✈️

EAS Build + EAS Update

expo.dev/eas · Expo Application Services

Free Tier

EAS Build compiles the app in the cloud — no Xcode or Android Studio required locally. EAS Update pushes OTA (over-the-air) JS bundle updates to users without App Store review.

**Why:** Critical for a solo developer. Bug in production? Push a fix in minutes via EAS Update without waiting 24–48h for App Store review. Free tier includes 30 builds/month.

### Development Tooling

🐙

GitHub

github.com

Free

Source control, code review, GitHub Actions for CI, and GitHub Issues for bug tracking that syncs with Plane via webhook.

**Branches:** `main` (production), `develop` (integration), `feature/*` (feature branches). PRs merge into `develop`, `develop` merges into `main` on release.

📋

Plane

plane.so · MCP enabled

Free

Kanban board for task tracking, Cycles for 2-week sprints, Modules for grouping by app area (Consumer App, Operator App, Backend, Design System).

**MCP:** Connected to Claude — create, update, and query tickets in plain conversation. Link Plane issues to GitHub PRs for full traceability.

🎨

Figma

figma.com

Free Tier

UI design, component specs, and developer handoff. Design system lives here as Figma Variables mirroring the Street Fire tokens in the design system doc.

**Handoff:** Figma Dev Mode gives the developer exact spacing, font, and color values per component — eliminating guesswork during implementation.

03 — System Architecture

## HOW IT ALL CONNECTS

A layer-by-layer breakdown of how the TruckTrack system is structured — from the device to the database.

### Layer Map

Device Layer

iOS App (Expo) Android App (Expo) Expo Go (dev only)

UI Layer

Gluestack UI v3 Expo Router v4 React Native Reanimated Mapbox RN SDK

State Layer

Zustand (global state) TanStack Query (server state) Supabase Realtime (live updates)

Service Layer

Supabase Client Stripe SDK Expo Notifications Sentry PostHog

Backend Layer

Supabase (Postgres) Supabase Auth Supabase Storage Supabase Edge Functions

External APIs

Stripe Billing API Mapbox Geocoding API Expo Push API (APNs / FCM)

Build / Deploy

EAS Build EAS Update (OTA) GitHub Actions (CI) Apple App Store Google Play Store

### Real-Time Data Flow — Operator Publishes Location

| Step | What Happens                                                             | Technology                     |
| ---- | ------------------------------------------------------------------------ | ------------------------------ |
| 1    | Operator taps "Publish Now" in the Today screen                          | React Native UI                |
| 2    | Location + hours written to `truck_schedules` table                      | Supabase Client → Postgres     |
| 3    | Supabase Realtime broadcasts the change to all connected consumers       | Supabase Realtime (WebSocket)  |
| 4    | Consumer map pins update live without a manual refresh                   | TanStack Query invalidation    |
| 5    | Supabase Edge Function triggers push notification job                    | Supabase Edge Functions (Deno) |
| 6    | Push sent to all followers who have notifications enabled for this truck | Expo Push API → APNs / FCM     |

04 — Folder Structure

## MONOREPO STRUCTURE

One GitHub repository containing both the React Native app and the Supabase backend. The Supabase CLI expects the `supabase/` directory at the repo root — this is the standard monorepo layout for Expo + Supabase projects.

**Why a monorepo?** As a solo developer, one repo means one place for issues, one CI pipeline, and shared TypeScript types between the app and Edge Functions. You never have to keep two repos in sync.

**App variants — one codebase, two binaries.** `app/(consumer)/` and `app/(operator)/` compile into two independently-distributed App Store / Play Store listings (`TruckTrack` and `TruckTrack Ops`) via the `APP_VARIANT` env var read by `app.config.ts`. Same `components/`, `stores/`, `services/`, and Supabase code — different bundle IDs, names, icons, schemes, and Expo project IDs. See the App Variants section in `CLAUDE.md` for the dev-workflow rules; see section 08 below for the six EAS profiles that drive per-variant builds.

### Top-Level Overview

    trucktrack/                       ← Single GitHub repository
    │
    ├── app/                            ← 📱 React Native app (Expo Router)
    ├── components/                     ← Shared UI components
    ├── hooks/                          ← Custom React hooks
    ├── stores/                         ← Zustand state stores
    ├── services/                       ← External API clients
    ├── lib/                            ← Shared types, utils, constants
    ├── theme/                          ← Gluestack Street Fire config
    ├── assets/                         ← Fonts, images, icons
    │
    ├── supabase/                       ← 🖥️ Backend (Supabase CLI managed)
    │   ├── functions/                  ← Edge Functions (your "server code")
    │   ├── migrations/                 ← SQL schema version history
    │   └── tests/                      ← Edge Function tests (Deno)
    │
    ├── .github/                        ← CI/CD workflows
    │   └── workflows/
    │
    ├── app.json                        ← Expo config
    ├── eas.json                        ← EAS Build profiles
    ├── tsconfig.json
    ├── .env.local                      ← Local secrets (git-ignored)
    ├── .env.example                    ← Template (committed)
    └── CLAUDE.md                       ← Claude Code context

### 📱 App — React Native (Expo)

    app/                              ← Expo Router: file = screen route
    ├── (consumer)/                   ← Consumer tab group
    │   ├── _layout.tsx                ← Tab bar definition
    │   ├── index.tsx                  ← 🗺️  Map view (default home)
    │   ├── following.tsx              ← ⭐ My Trucks feed
    │   ├── stamps.tsx                 ← 🎟️  Loyalty card wallet
    │   ├── alerts.tsx                 ← 🔔 Notification inbox
    │   └── profile.tsx                ← 👤 Consumer account + settings
    │
    ├── (operator)/                   ← Operator tab group
    │   ├── _layout.tsx                ← Operator tab bar
    │   ├── today.tsx                  ← 📍 Quick location publish
    │   ├── schedule.tsx               ← 📅 7-day schedule manager
    │   ├── analytics.tsx              ← 📊 Follower & engagement stats
    │   ├── catering.tsx               ← 🍽️  Catering request inbox
    │   └── settings.tsx               ← ⚙️  Profile, plan, billing
    │
    ├── truck/
    │   └── [id].tsx                   ← Truck profile (dynamic route)
    │
    ├── onboarding/
    │   ├── consumer.tsx               ← 3-screen consumer intro
    │   └── operator.tsx               ← 6-step operator setup flow
    │
    ├── auth/
    │   ├── login.tsx
    │   └── signup.tsx
    │
    └── _layout.tsx                    ← Root layout: auth gate, providers

    components/
    ├── ui/                          ← Base Gluestack-extended components
    │   ├── Button.tsx
    │   ├── Badge.tsx
    │   ├── Input.tsx
    │   └── Toast.tsx
    ├── truck/                       ← Truck-specific UI
    │   ├── TruckCard.tsx              ← Card used in map sheet + feed
    │   ├── TruckPin.tsx               ← Custom Mapbox map marker
    │   └── TruckStatusBadge.tsx
    ├── map/
    │   ├── MapView.tsx                ← Mapbox wrapper
    │   └── BottomSheet.tsx            ← Draggable sheet over map
    ├── operator/
    │   ├── LocationPicker.tsx         ← Address search + map pin drop
    │   ├── SavedLocationChips.tsx     ← Quick-tap frequent locations
    │   └── HoursPicker.tsx
    └── shared/
        ├── EmptyState.tsx
        ├── SkeletonCard.tsx
        └── LanguageToggle.tsx         ← EN / FR switcher

    hooks/
    ├── useTrucks.ts                   ← Fetch + realtime truck list
    ├── useFollowing.ts                ← Followed trucks + follow/unfollow
    ├── useOperatorSchedule.ts         ← Read/write operator schedule
    ├── usePushNotifications.ts        ← Token registration + permissions
    └── useAuth.ts                     ← Session, login, logout

    stores/
    ├── authStore.ts                   ← User session + role (consumer|operator)
    ├── locationStore.ts               ← Device GPS location
    └── notificationStore.ts           ← Unread count + inbox items

    services/
    ├── supabase.ts                    ← Supabase client init + typed helpers
    ├── stripe.ts                      ← Stripe client init
    └── notifications.ts               ← Expo push token helpers

    lib/
    ├── types.ts                       ← ALL shared TypeScript interfaces
    ├── constants.ts                   ← App-wide constants (plan prices, etc.)
    └── utils.ts                       ← Date formatting, distance calc, etc.

### 🖥️ Backend — Supabase

    supabase/                         ← Generated + managed by Supabase CLI
    │
    ├── functions/                      ← Edge Functions = your server code (Deno/TypeScript)
    │   │
    │   ├── stripe-webhook/             ← Receives Stripe billing events
    │   │   └── index.ts               ← subscription.created, payment_failed, etc.
    │   │
    │   ├── send-notifications/         ← Triggered when operator publishes location
    │   │   └── index.ts               ← Queries followers, calls Expo Push API
    │   │
    │   ├── daily-reminder/             ← Cron: runs at 8am daily
    │   │   └── index.ts               ← Finds operators with no schedule today → SMS/push
    │   │
    │   ├── loyalty-stamp/              ← Called when operator scans consumer QR
    │   │   └── index.ts               ← Validates QR, increments stamp count, checks goal
    │   │
    │   ├── catering-notify/            ← New catering request → email to operator
    │   │   └── index.ts
    │   │
    │   └── _shared/                    ← Shared utils across Edge Functions
    │       ├── supabaseAdmin.ts        ← Supabase service-role client
    │       ├── expoPush.ts             ← Expo Push API wrapper
    │       └── cors.ts                 ← CORS headers helper
    │
    ├── migrations/                     ← SQL files — one per schema change
    │   ├── 20260101000000_init.sql     ← Initial schema: all core tables
    │   ├── 20260115000000_rls.sql      ← Row Level Security policies
    │   ├── 20260120000000_triggers.sql ← Auto-create profile on signup, etc.
    │   └── 20260201000000_indexes.sql  ← Performance indexes
    │
    ├── tests/                          ← Deno tests for Edge Functions
    │   └── stripe-webhook.test.ts
    │
    └── config.toml                     ← Supabase CLI project config (committed)

### 🔄 How App and Backend Share Types

TypeScript types defined in `lib/types.ts` are shared between the app and Edge Functions. Import from a relative path in Edge Functions to keep a single source of truth.

lib/types.ts — shared across app + edge functions

    export interface Truck {
      id: string
      operator_id: string
      name: string
      cuisine_tags: string[]
      plan: 'free' | 'starter' | 'pro' | 'festival'
      is_active: boolean
      catering_enabled: boolean
    }

    export interface TruckSchedule {
      id: string
      truck_id: string
      date: string
      location_lat: number
      location_lng: number
      location_label: string
      open_time: string
      close_time: string
      status: 'scheduled' | 'live' | 'cancelled'
    }

    export interface Follow {
      consumer_id: string
      truck_id: string
      notify_open: boolean
      notify_location_change: boolean
      notify_special: boolean
    }

### 🚀 Supabase CLI Workflow

    # Initialise Supabase in your project root (run once)
    npx supabase init

    # Link to your remote Supabase project
    npx supabase link --project-ref your-project-ref

    # Start local Supabase stack (Postgres + Auth + Storage)
    npx supabase start

    # Create a new migration after changing schema
    npx supabase migration new add_catering_requests

    # Push migrations to remote (production)
    npx supabase db push

    # Deploy a single Edge Function
    npx supabase functions deploy stripe-webhook

    # Deploy all Edge Functions
    npx supabase functions deploy

    # Tail Edge Function logs in real-time
    npx supabase functions logs stripe-webhook --tail

**Naming conventions:** App components → PascalCase (`TruckCard.tsx`). Hooks → camelCase with `use` prefix (`useTrucks.ts`). Stores → camelCase with `Store` suffix (`authStore.ts`). Edge Functions → kebab-case directory names (`stripe-webhook/`). SQL migrations → timestamp prefix + descriptive name.

05 — Database Schema

## SUPABASE SCHEMA

Core Postgres tables in Supabase. Row Level Security (RLS) is enabled on all tables — operators can only read/write their own truck data. Consumers can read public truck data.

### Core Tables

| Table               | Key Columns                                                                                                                                                            | Notes                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `profiles`          | `id`, `role` (consumer / operator), `display_name`, `avatar_url`, `language` (en / fr)                                                                                 | Extends Supabase Auth `users` table. Created via trigger on signup.                           |
| `trucks`            | `id`, `operator_id`, `name`, `cuisine_tags`, `description`, `cover_url`, `plan` (free / starter / pro / festival), `is_active`, `catering_enabled`                     | One truck per operator for MVP. `is_active` false during winter pause.                        |
| `truck_schedules`   | `id`, `truck_id`, `date`, `location_lat`, `location_lng`, `location_label`, `open_time`, `close_time`, `is_recurring`, `status` (scheduled / live / cancelled)         | Realtime subscribed by consumers. Daily reminder checks this table for missing entries.       |
| `follows`           | `consumer_id`, `truck_id`, `notify_open`, `notify_location_change`, `notify_special`                                                                                   | Composite PK on (consumer_id, truck_id). Per-notification-type granular controls.             |
| `loyalty_cards`     | `id`, `consumer_id`, `truck_id`, `stamp_count`, `stamp_goal`, `reward_label`                                                                                           | One row per consumer+truck pair. Created when operator has loyalty enabled (Pro plan).        |
| `catering_requests` | `id`, `truck_id`, `requester_name`, `requester_email`, `event_date`, `event_type`, `guest_count`, `location`, `budget`, `status` (new / accepted / declined / expired) | Visible to truck operator only. Status change triggers email notification.                    |
| `notifications_log` | `id`, `consumer_id`, `truck_id`, `type`, `message`, `read_at`, `created_at`                                                                                            | Persistent in-app inbox. Push delivery is separate (Expo Push API). Both point to same event. |

**To be completed:** Full SQL schema with RLS policies, indexes, and foreign key constraints. Add here once the Supabase project is initialised and migrations are written.

🗃️

Supabase Migration Files

Add SQL migration references here once supabase/migrations/ is populated

06 — Environment Variables

## ENV CONFIG

All secrets and environment-specific values are stored in `.env.local` (never committed to Git) and in EAS Secrets for build-time injection. Never hardcode keys.

**Setup:** Copy `.env.example` to `.env.local` and fill in your values. The `.env.example` file is committed to Git with placeholder values only.

### Required Variables

EXPO_PUBLIC_SUPABASE_URL

Your Supabase project URL → Settings → API

EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

Supabase publishable key (sb*publishable*\*) — safe to expose. Security depends on RLS being enabled with policies.

SUPABASE_SECRET_KEY

⚠️ Server-side only — sb*secret*\* — Edge Functions / CI. Bypasses RLS. Never in client bundle.

EXPO_PUBLIC_SUPABASE_ANON_KEY

Legacy anon JWT. Carried alongside the new publishable key so we can flip the app client between formats at integration time.

SUPABASE_SERVICE_ROLE_KEY

⚠️ Server-side only — legacy service*role* JWT. Auto-injected into Edge Functions by the Supabase runtime — saves per-function `secrets set` configuration until we decide to move Edge Functions to the new format.

EXPO_PUBLIC_MAPBOX_TOKEN

Mapbox public access token → mapbox.com/account/tokens

STRIPE_PUBLISHABLE_KEY

Stripe publishable key (safe to expose in client)

STRIPE_SECRET_KEY

⚠️ Server-side only — Supabase Edge Functions only

STRIPE_WEBHOOK_SECRET

Stripe webhook signing secret — Edge Function receives billing events

EXPO_PUBLIC_SENTRY_DSN

Sentry project DSN → sentry.io project settings

EXPO_PUBLIC_POSTHOG_KEY

PostHog project API key → posthog.com project settings

.env.example

    # Supabase
    EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    # New key format (preferred for the app client)
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
    SUPABASE_SECRET_KEY=sb_secret_your_key_here
    # Legacy key format (kept for Edge Function auto-injection)
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-jwt-here
    SUPABASE_SERVICE_ROLE_KEY=your-service-role-jwt-here

    # Mapbox
    EXPO_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token

    # Stripe
    STRIPE_PUBLISHABLE_KEY=pk_test_your-key
    STRIPE_SECRET_KEY=sk_test_your-key
    STRIPE_WEBHOOK_SECRET=whsec_your-secret

    # Monitoring
    EXPO_PUBLIC_SENTRY_DSN=https://[email protected]/project-id
    EXPO_PUBLIC_POSTHOG_KEY=phc_your-key

07 — GitHub Workflow

## BRANCHING STRATEGY

A simple trunk-based workflow suited to a solo developer. Two long-lived branches, short-lived feature branches.

### Branch Structure

| Branch                           | Purpose                                                      | Deploys to                                                                                         |
| -------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `main`                           | Production-ready code only. Never push directly.             | App Store + Play Store via `production-consumer` AND `production-operator` EAS profiles (both run) |
| `develop`                        | Integration branch. All features merge here first.           | TestFlight + Play Internal via `preview-consumer` AND `preview-operator` EAS profiles (both run)   |
| `feature/[ticket-id]-short-name` | One branch per Plane ticket. e.g. `feature/TT-42-map-screen` | Local / Expo Go / local dev clients (`npm run start:consumer` or `start:operator`)                 |
| `fix/[ticket-id]-short-name`     | Bug fixes. Same pattern as feature branches.                 | Local → develop → main via hotfix if urgent                                                        |

Every `develop` and `main` deploy runs **both** variant pipelines in parallel — a change in shared code (`components/`, `stores/`, `services/`) ships to both apps at once; a change in `app/(consumer)/` or `app/(operator)/` only changes its respective binary (but still builds both because the two share the same codebase and bundle together).

### PR Rules

Feature → develop

- All new work goes into `develop` first
- GitHub Actions runs TypeScript check + lint
- Link PR to the Plane ticket in the PR description

develop → main

- Only on planned release — not ad-hoc
- EAS Build triggers automatically via GitHub Action
- Tag the commit with semantic version e.g. `v1.0.0`

### Commit Message Format

    type(scope): short description  [TT-42]

    # Types: feat | fix | chore | refactor | docs | style | test
    # Scope: consumer | operator | map | auth | db | notifications | payments
    # [TT-42] links to the Plane ticket

    # Examples:
    feat(map): add truck pin clustering for dense areas [TT-12]
    fix(operator): prevent duplicate location publish on double-tap [TT-38]
    chore(deps): upgrade Gluestack UI to v3.1.0

08 — CI/CD Pipeline

## BUILD & DEPLOY

GitHub Actions handles automated checks on every PR. EAS handles all builds and deployments. No manual build steps.

### Pipeline Overview

| Trigger               | Pipeline         | What Runs                                                                                                                             |
| --------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| PR opened → `develop` | CI Check         | TypeScript compile check (`tsc --noEmit`), ESLint, Expo Doctor                                                                        |
| Push to `develop`     | Preview Build    | EAS Build runs `preview-consumer` + `preview-operator` in parallel → TestFlight Internal + Play Internal Testing (two separate lanes) |
| Push to `main`        | Production Build | EAS Build runs `production-consumer` + `production-operator` in parallel → App Store + Play Store via EAS Submit (two separate lanes) |
| Hotfix on `main`      | OTA Update       | EAS Update pushes JS bundle fix directly to users of the affected variant — no store review needed (one variant at a time)            |

### EAS Profiles

Six variant-aware profiles — no bare `development` / `preview` / `production`. Always pick a variant.

eas.json

    {
      "build": {
        "development-consumer": {
          "developmentClient": true,
          "distribution": "internal",
          "env": { "APP_VARIANT": "consumer" }
        },
        "development-operator": {
          "developmentClient": true,
          "distribution": "internal",
          "env": { "APP_VARIANT": "operator" }
        },
        "preview-consumer": {
          "distribution": "internal",
          "channel": "preview-consumer",
          "env": { "APP_VARIANT": "consumer" }
        },
        "preview-operator": {
          "distribution": "internal",
          "channel": "preview-operator",
          "env": { "APP_VARIANT": "operator" }
        },
        "production-consumer": {
          "autoIncrement": true,
          "channel": "production-consumer",
          "env": { "APP_VARIANT": "consumer" }
        },
        "production-operator": {
          "autoIncrement": true,
          "channel": "production-operator",
          "env": { "APP_VARIANT": "operator" }
        }
      },
      "submit": {
        "production-consumer": {
          "ios": { "appleId": "[email protected]" },
          "android": { "serviceAccountKeyPath": "./google-service-account.json" }
        },
        "production-operator": {
          "ios": { "appleId": "[email protected]" },
          "android": { "serviceAccountKeyPath": "./google-service-account.json" }
        }
      }
    }

⚙️

GitHub Actions Workflows

Add .github/workflows/ YAML references here once CI is configured

09 — Local Setup

## GETTING STARTED

Everything needed to get the project running on a new machine from scratch. Run these steps in order.

### Prerequisites

| Tool       | Version | Install                                          |
| ---------- | ------- | ------------------------------------------------ |
| Node.js    | 20 LTS  | `nvm install 20`                                 |
| EAS CLI    | Latest  | `npm install -g eas-cli`                         |
| Expo Go    | Latest  | App Store / Play Store on your test device       |
| Expo Orbit | Latest  | expo.dev/orbit — manages simulator builds on Mac |

### First-Time Setup

    # 1. Clone the repo
    git clone https://github.com/your-username/trucktrack.git
    cd trucktrack

    # 2. Install dependencies
    npm install

    # 3. Copy env file and fill in your values
    cp .env.example .env.local

    # 4. Log in to Expo
    eas login

    # 5. Start the dev server for a specific variant
    npm run start:consumer   # TruckTrack (consumer app)
    # OR
    npm run start:operator   # TruckTrack Ops (operator app)

    # 6. Scan the QR code with Expo Go on your phone
    #    OR press 'i' for iOS simulator / 'a' for Android emulator

### Running each variant

`APP_VARIANT` drives which binary Metro serves. The two apps have different bundle IDs — iOS and Android install them as separate icons on the home screen. You can have both installed and toggle between them on the simulator.

- `npm run start:consumer` → Metro serves the consumer manifest. Name: "TruckTrack". Bundle: `com.sainabdallah.trucktrack`. Root gate routes into `app/(consumer)/`.
- `npm run start:operator` → Metro serves the operator manifest. Name: "TruckTrack Ops". Bundle: `com.sainabdallah.trucktrack.operator`. Root gate routes into `app/(operator)/today`.
- Bare `npx expo start` / `npm run start` defaults to `APP_VARIANT=consumer`.
- **Always Ctrl-C Metro and restart when switching variants** — a hot-swap with a stale manifest cache will serve the wrong name/icon.
- First time per variant per simulator: you need a dev client build. `eas build --profile development-consumer --platform ios` (once), `eas build --profile development-operator --platform ios` (once). After install, `npm run start:consumer` / `:operator` connect Metro to whichever client you boot.
- Expo Go works for JS-only iteration pre-dev-client, but can't test bundle-ID-dependent features (push, deep links, real name/icon).

### CLAUDE.md — AI Context File

Create a `CLAUDE.md` file in the project root. Claude Code reads this at the start of every session — it's the highest-leverage setup step for AI-assisted development.

CLAUDE.md (template)

    # TruckTrack — Claude Code Context

    ## Stack
    - Framework: Expo SDK 54 (React Native 0.76)
    - Navigation: Expo Router v4 (file-system routing)
    - UI: Gluestack UI v3 with Street Fire theme
    - State: Zustand (global) + TanStack Query v5 (server)
    - Backend: Supabase (Postgres, Auth, Realtime)
    - Language: TypeScript strict mode

    ## Coding Conventions
    - Functional components only — no class components
    - Props defined as interfaces, not type aliases
    - File names match component name in PascalCase (TruckCard.tsx)
    - Custom hooks start with 'use' (useTrucks.ts)
    - Always handle loading, error, and empty states explicitly
    - Street Fire palette: primary #FF5C00, accent #FFD23F, success #2ECC71, error #E74C3C

    ## Folder Structure
    - app/ → Expo Router routes
    - components/ → Reusable UI (ui/, truck/, map/, operator/)
    - hooks/ → Custom React hooks
    - stores/ → Zustand stores
    - services/ → External API clients
    - lib/ → Types, constants, utilities
    - theme/ → Gluestack Street Fire config

    ## Key Rules
    - Sharp corners (borderRadius: 0) on all buttons and inputs
    - Pill shape only for status badges
    - DM Mono font for all labels and badges, uppercase
    - One primary action per screen maximum
    - Operators must be able to publish location in ≤ 3 taps

**Tip:** Keep CLAUDE.md updated as architecture decisions are made. It's the difference between Claude generating code that fits your project and code you have to rewrite.

### Accounts to Set Up

| Service         | URL                     | Notes                                          | Status  |
| --------------- | ----------------------- | ---------------------------------------------- | ------- |
| GitHub          | github.com              | Create repo, set branch protection on `main`   | □ To do |
| Plane           | plane.so                | Create workspace, connect MCP to Claude        | □ To do |
| Expo / EAS      | expo.dev                | Create account, run `eas login`                | □ To do |
| Supabase        | supabase.com            | Create project, copy URL + anon key to .env    | □ To do |
| Mapbox          | mapbox.com              | Create account, generate access token          | □ To do |
| Stripe          | stripe.com              | Create account, set up 3 subscription products | □ To do |
| Sentry          | sentry.io               | Create React Native project, copy DSN          | □ To do |
| PostHog         | posthog.com             | Create project, copy API key                   | □ To do |
| Apple Developer | developer.apple.com     | $99/year — required for App Store              | □ To do |
| Google Play     | play.google.com/console | $25 one-time — required for Play Store         | □ To do |
