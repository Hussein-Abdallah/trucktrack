# TruckTrack — Setup Checklist

> Infrastructure and tooling to wire up before first users. Ordered by priority.

---

## 1. Sentry Error Tracking

**Priority:** Do now — before first screens
**Why:** Without this, production crashes are invisible until someone leaves a 1-star App Store review.

### Setup

```bash
npx expo install @sentry/react-native
```

### Configuration

```typescript
// app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableInExpoDevelopment: false,
  tracesSampleRate: 1.0,
});
```

### Environment Variable

```
EXPO_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/project-id
```

---

## 2. Supabase CLI Local Dev

**Priority:** Do now — required before writing first migration (TT-10, TT-11)
**Why:** Run a local Supabase instance while building — no risk of breaking production data.

### Setup

```bash
npx supabase init
npx supabase start
```

### Package.json Scripts

```json
"scripts": {
  "db:start": "supabase start",
  "db:stop": "supabase stop",
  "db:reset": "supabase db reset",
  "db:migrate": "supabase db push"
}
```

### Link to Remote

```bash
npx supabase link --project-ref your-project-ref
```

---

## 3. EAS Build Preview Channel

**Priority:** Defer — set up when first mergeable feature lands on develop
**Why:** Every push to develop automatically builds a TestFlight/internal build. Premature CI builds burn free EAS quota before there's anything to test.

### GitHub Actions Step

```yaml
- name: EAS Preview Build
  run: eas build --platform all --profile preview --non-interactive
  env:
    EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

### EAS Profile (eas.json)

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    }
  }
}
```

### Prerequisites

- `EXPO_TOKEN` added to GitHub repo secrets
- `develop` branch created with branch protection
- At least one buildable screen in the app
