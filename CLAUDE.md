# TruckTrack — Claude Code Context

## What This App Is

TruckTrack is a two-sided React Native marketplace for food trucks in Ottawa, Canada.

- **Consumer app** — find nearby food trucks on a map, follow favourites, get push notifications when they open, collect digital loyalty stamps
- **Operator app** — publish today's location in under 30 seconds, manage weekly schedule, view follower analytics, receive catering booking requests
- **Market** — Ottawa-first, bilingual (English + French), expanding to other Canadian cities after MVP

## Tech Stack

- **Framework**: Expo SDK 54 (React Native 0.76, New Architecture enabled)
- **Language**: TypeScript — strict mode always on
- **Navigation**: Expo Router v4 (file-system routing — file = screen)
- **UI Library**: Gluestack UI v3 (Street Fire theme applied)
- **Styling**: NativeWind (Tailwind for React Native)
- **State — global**: Zustand
- **State — server**: TanStack Query v5
- **Backend**: Supabase (Postgres, Auth, Realtime, Storage, Edge Functions)
- **Maps**: Mapbox React Native SDK
- **Payments**: Stripe (subscriptions + catering deposits)
- **Push Notifications**: Expo Notifications (APNs + FCM)
- **Error Tracking**: Sentry
- **Analytics**: PostHog
- **Build / Deploy**: EAS Build + EAS Update (OTA)

## Monorepo Structure

```
trucktrack/
├── app/                    # Expo Router screens
│   ├── (consumer)/         # Consumer tab group
│   │   ├── index.tsx       # Map view (home tab)
│   │   ├── following.tsx   # My Trucks feed
│   │   ├── stamps.tsx      # Loyalty card wallet
│   │   ├── alerts.tsx      # Notification inbox
│   │   └── profile.tsx     # Consumer account
│   ├── (operator)/         # Operator tab group
│   │   ├── today.tsx       # Quick location publish
│   │   ├── schedule.tsx    # Weekly schedule
│   │   ├── analytics.tsx   # Follower stats (Pro)
│   │   ├── catering.tsx    # Catering requests
│   │   └── settings.tsx    # Profile, plan, billing
│   ├── truck/[id].tsx      # Truck profile (dynamic)
│   ├── onboarding/         # First-launch flows
│   ├── auth/               # Login / signup
│   └── _layout.tsx         # Root layout + auth gate
├── components/
│   ├── ui/                 # Base components (Button, Badge, Input, Toast)
│   ├── truck/              # TruckCard, TruckPin, TruckStatusBadge
│   ├── map/                # MapView, BottomSheet
│   ├── operator/           # LocationPicker, SavedLocationChips, HoursPicker
│   └── shared/             # EmptyState, SkeletonCard, LanguageToggle
├── hooks/                  # Custom React hooks (logic only, no JSX)
├── stores/                 # Zustand stores
├── services/               # External API clients (supabase.ts, stripe.ts, notifications.ts)
├── lib/                    # Shared TypeScript types, constants, utils
├── theme/                  # Gluestack Street Fire config
├── assets/                 # Fonts, images, icons
├── supabase/
│   ├── functions/          # Edge Functions (Deno/TypeScript) = server code
│   │   ├── stripe-webhook/
│   │   ├── send-notifications/
│   │   ├── daily-reminder/
│   │   ├── loyalty-stamp/
│   │   ├── catering-notify/
│   │   └── _shared/        # Shared utils across functions
│   ├── migrations/         # SQL schema files (timestamped)
│   └── tests/
└── .github/workflows/      # GitHub Actions CI/CD
```

## Design System — Street Fire Palette

```
Primary brand:    #FF5C00  (Fire Orange)   — CTAs, buttons, brand elements
Hover/pressed:    #FF8A40  (Orange Light)  — interactive states only
Accent:           #FFD23F  (Signal Yellow) — secondary badges, counts
Success/open:     #2ECC71  (Active Green)  — open status, following, confirmed
Error/closed:     #E74C3C  (Alert Red)     — closed status, errors, danger actions
Page background:  #0F0F0F  (App Black)
Card surface:     #1A1A1A  (Charcoal)
Elevated surface: #252525  (Graphite)
Borders:          #3A3A3A  (Mid)
Muted text:       #888888
Body text:        #F5F0E8  (Warm Cream)
```

## Typography

```
Display/headings: Bebas Neue (32–48px, letter-spacing: 2)
Body large:       DM Sans 16px weight 300–400
Body medium:      DM Sans 14px weight 300–400
Body small:       DM Sans 12px weight 300
Labels/badges:    DM Mono 10–11px UPPERCASE letter-spacing: 1.5
```

## Coding Conventions

- **Components**: functional only — no class components ever
- **Props**: always defined as `interface`, never `type` alias
- **File naming**: PascalCase for components (`TruckCard.tsx`), camelCase for everything else
- **Hooks**: must start with `use` (`useTrucks.ts`, `useFollowing.ts`)
- **Stores**: camelCase + `Store` suffix (`authStore.ts`)
- **Edge Functions**: kebab-case directory names (`stripe-webhook/`)
- **Always** handle loading, error, and empty states explicitly — never assume data exists
- **Always** use the shared types from `lib/types.ts` — never inline one-off interfaces for DB entities
- **Never** hardcode colours — always use theme tokens or the Street Fire hex values above
- **Never** use `any` — if you don't know the type, use `unknown` and narrow it

## Shape Rules (Critical for Brand Consistency)

- `borderRadius: 0` on ALL buttons and inputs — sharp corners are the brand
- `borderRadius: 9999` (pill) ONLY for status badges (Open Now, Closed, etc.)
- `borderRadius: 4` for modals, dropdowns, bottom sheets
- No drop shadows, gradients, blur, or glow effects anywhere

## UI Patterns

- **One primary (orange) button per screen maximum**
- **Bottom sheet** for map overlays — not full-screen navigation
- **DM Mono uppercase** for all button text, badge text, section labels
- **Skeleton loaders** required on every screen that fetches data
- **Empty states** must be designed and implemented for every list/feed
- **Pull to refresh** on all feed screens (My Trucks, Notifications)

## Supabase Conventions

- **Row Level Security is always on** — operators can only read/write their own data
- **Never** use the service role key in the client app — Edge Functions only
- **Realtime** subscription on `truck_schedules` for live map updates
- **Triggers** handle: auto-create profile on signup, push notification fan-out
- All DB queries go through typed Supabase client helpers in `services/supabase.ts`

## Key Business Rules (Encode in Code)

- Operator location publish must be completable in ≤ 3 taps from the Today screen
- Saved locations (frequent addresses) must appear as one-tap chips — no typing required for regulars
- Free tier operators: basic listing only, no analytics, no loyalty
- Starter ($19/mo): adds push notifications to followers, schedule, location updates
- Pro ($39/mo): adds analytics dashboard, loyalty stamp program, priority placement
- Festival ($79/mo): temporary event mode
- Winter pause: sets `is_active = false` on the truck, pauses Stripe subscription, hides from map
- Catering only available to operators with `catering_enabled = true`
- Loyalty stamp cards only exist if the truck has `plan = 'pro'`
- Push notifications only sent to followers where the relevant `notify_*` flag is true

## Bilingual Requirements

- All user-facing strings must support English and French
- French strings are ~25% longer — never hard-clip text in layouts
- Language preference stored in `profiles.language` ('en' | 'fr')
- Language toggle available on onboarding screen 1 and in profile settings

## Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL          # Supabase project URL
EXPO_PUBLIC_SUPABASE_ANON_KEY     # Supabase anon key (safe in client)
SUPABASE_SERVICE_ROLE_KEY         # Server-side only (Edge Functions)
EXPO_PUBLIC_MAPBOX_TOKEN          # Mapbox public access token
STRIPE_PUBLISHABLE_KEY            # Stripe publishable key
STRIPE_SECRET_KEY                 # Server-side only (Edge Functions)
STRIPE_WEBHOOK_SECRET             # Stripe webhook signing secret
EXPO_PUBLIC_SENTRY_DSN            # Sentry project DSN
EXPO_PUBLIC_POSTHOG_KEY           # PostHog API key
```

## Git Conventions

```text
Branch naming:
  feature/TT-[ticket-id]-short-name   e.g. feature/TT-42-map-screen
  fix/TT-[ticket-id]-short-name       e.g. fix/TT-38-duplicate-publish

Commit format:
  type(scope): description [TT-id]

  Types:  feat | fix | chore | refactor | docs | style | test
  Scopes: consumer | operator | map | auth | db | notifications | payments

Examples:
  feat(map): add truck pin clustering for dense areas [TT-12]
  fix(operator): prevent duplicate location publish on double-tap [TT-38]
  chore(deps): upgrade Gluestack UI to v3.1.0
```

## What NOT to Do

- Never use `borderRadius > 0` on buttons or inputs
- Never use green or red as CTA colours — status only
- Never use orange for success/error states — brand only
- Never hardcode secrets — always use env vars
- Never push directly to `main` — always PR through `develop`
- Never skip loading and error states to save time
- Never install a package without checking if Expo SDK already includes it (`expo install` not `npm install` for native modules)
- Never write SQL migrations by hand — always use `npx supabase migration new`
