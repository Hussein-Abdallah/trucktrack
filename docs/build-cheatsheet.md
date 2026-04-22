# TruckTrack — Run & Build Cheat Sheet

Quick reference for running and building the consumer + operator app variants on iOS and Android, both locally and via EAS remote.

> **Always restart Metro (Ctrl-C then re-run) when switching `APP_VARIANT`** — the stale manifest cache will give you the wrong name / icon / routing.

---

## Dev server (Metro only — needs an existing dev client installed)

```bash
npm run start:consumer        # APP_VARIANT=consumer → TruckTrack
npm run start:operator        # APP_VARIANT=operator → TruckTrack Ops

# Opens Metro and tries to launch a target immediately:
npm run ios:consumer          # iOS simulator, consumer variant
npm run ios:operator          # iOS simulator, operator variant
npm run android:consumer      # Android emulator/device, consumer
npm run android:operator      # Android emulator/device, operator
```

Bare `npm run start | ios | android` defaults to `APP_VARIANT=consumer`.

In the Metro UI:
- `i` → open iOS simulator
- `a` → open Android emulator
- `r` → reload
- `j` → open debugger
- `shift+m` → toggle dev menu on connected device

---

## Local builds (compile native binary on your machine)

Use when EAS quota is exhausted or you want full control. Requires Xcode (iOS) and Android Studio + JDK 17 (Android) installed.

### Pre-flight (run once, or after every native dep change)

```bash
npx expo prebuild --clean     # regenerates ios/ + android/ from app.config.ts
```

`--clean` wipes any prior native folders. Skip the flag on subsequent runs if you have manual native edits to preserve (we don't).

### iOS — local

```bash
# Simulator (no signing required):
APP_VARIANT=consumer npx expo run:ios
APP_VARIANT=operator npx expo run:ios

# Specific simulator:
APP_VARIANT=consumer npx expo run:ios --device "iPhone 16 Pro"

# Physical device (requires Apple Developer cert, will prompt for device pick):
APP_VARIANT=consumer npx expo run:ios --device

# Release config (test production-like build locally):
APP_VARIANT=consumer npx expo run:ios --configuration Release
```

**First-time iOS prereqs:**
```bash
brew install cocoapods         # NOT via gem — rbenv conflicts
pod --version                  # confirm brew's pod resolves
```

### Android — local

```bash
# Emulator or connected device (auto-detects):
APP_VARIANT=consumer npx expo run:android
APP_VARIANT=operator npx expo run:android

# Specific device (use `adb devices` to list):
APP_VARIANT=consumer npx expo run:android --device <id>

# Release variant:
APP_VARIANT=consumer npx expo run:android --variant release
```

**First-time Android prereqs:**
```bash
brew install --cask android-studio
brew install --cask temurin@17           # JDK 17 — NOT 25, gradle breaks
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
# Add the export to ~/.zshrc to persist
```

Open Android Studio once → SDK Manager → install Platform 35 + Build-Tools 35.

### After a local build

The dev client `.app` / `.apk` is now installed. Start Metro to load JS into it:

```bash
npm run start:consumer        # then press i / a, or open the app on the device
```

Subsequent JS-only changes don't need a rebuild — just reload Metro.

---

## EAS remote builds (Expo cloud)

Use for: shareable internal builds, simulator builds for teammates without Xcode, production releases. Free tier has limited concurrent builds + a queue (~3h wait when busy).

### One-time setup

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### Profile reference (`eas.json`)

| Profile                            | Variant  | Target                       | Use                                |
| ---------------------------------- | -------- | ---------------------------- | ---------------------------------- |
| `development-consumer`             | consumer | iOS device (.ipa) + Android  | Daily dev on physical device       |
| `development-operator`             | operator | iOS device (.ipa) + Android  | Daily dev on physical device       |
| `development-consumer-simulator`   | consumer | iOS simulator (.app)         | Run dev client in iOS sim          |
| `development-operator-simulator`   | operator | iOS simulator (.app)         | Run dev client in iOS sim          |
| `preview-consumer` / `-operator`   |          | Internal distribution        | Share with testers                 |
| `production-consumer` / `-operator`|          | App Store / Play Store ready | Final release builds               |

There is no bare `development` / `preview` / `production` — always pick a variant.

### iOS — EAS

```bash
# Physical device dev build (signed .ipa, prompts to register device first time):
eas build --profile development-consumer --platform ios
eas build --profile development-operator --platform ios

# Simulator dev build (.app, drag-drop into Simulator):
eas build --profile development-consumer-simulator --platform ios
eas build --profile development-operator-simulator --platform ios

# Internal preview / production:
eas build --profile preview-consumer --platform ios
eas build --profile production-consumer --platform ios
```

When the build finishes:
- **Device build**: scan the QR code from the EAS build page, install via Safari → Settings → trust profile
- **Simulator build**: download the `.tar.gz`, extract → drag the `.app` into the running Simulator window

### Android — EAS

```bash
eas build --profile development-consumer --platform android
eas build --profile development-operator --platform android
eas build --profile preview-consumer --platform android
eas build --profile production-consumer --platform android
```

Output is an `.apk` (dev/preview) or `.aab` (production). Install dev/preview apks via:
```bash
adb install path/to/app.apk
```
Or scan the QR from the EAS build page on the device.

### Both platforms in one command

```bash
eas build --profile development-consumer --platform all
```

---

## When do I need a native rebuild?

JS-only changes (TS, components, hooks, styles, i18n strings) → **no rebuild**, Metro reload is enough.

You **must rebuild** the dev client (local or EAS) when:
- Adding a native dep (`npx expo install @some/native-package`)
- Editing `app.config.ts` plugins or native config (icons, splash, bundle id, scheme)
- Bumping any `expo-*` package that changes native peers
- Changing entries in `ios/Podfile` or `android/build.gradle` (we don't, but if `prebuild` regenerates them differently — yes)

After a native rebuild, the **3-surface verification gate is mandatory** before merge:
1. iOS physical device
2. iOS simulator
3. Android (emulator or device)

Document all three in the PR body. Mapbox install (TT-34) is the canonical example of why — surface-specific breakage is common.

---

## OTA updates (no rebuild, no app-store review)

For JS-only changes already shipped to a binary on a known channel:

```bash
eas update --channel preview-consumer --message "fix: copy tweak"
eas update --channel production-consumer --message "feat: …"
```

Channel = the `channel` field on the matching `eas.json` profile. Dev clients don't use channels.

---

## Common gotchas

- **CocoaPods via rbenv breaks** → `gem uninstall cocoapods activesupport`, then `brew install cocoapods`.
- **Java 25 breaks gradle** → install JDK 17 via `brew install --cask temurin@17`, set `JAVA_HOME` to it.
- **Wrong variant launches** → you forgot to Ctrl-C and restart Metro after switching `APP_VARIANT`.
- **"Invalid size" Mapbox warning** → cosmetic, fires before flex layout completes; ignore.
- **Stale dev client error after native change** → rebuild; the JS bundle's native peer expectations no longer match the installed binary.
- **EAS quota hit / 3h queue** → switch to local `expo run:ios` / `expo run:android`.
- **`INSTALL_FAILED_UPDATE_INCOMPATIBLE` on Android** → existing app on the device was signed with a different keystore (e.g., EAS build vs local debug). Uninstall first: `adb uninstall com.sainabdallah.trucktrack` (or `.operator`), then re-run. Same drill switching between local builds and EAS builds.
