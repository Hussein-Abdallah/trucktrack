import type { ExpoConfig } from 'expo/config';

type AppVariant = 'consumer' | 'operator';

interface VariantOverrides {
  name: string;
  slug: string;
  scheme: string;
  iosBundleIdentifier: string;
  androidPackage: string;
  icon: string;
  adaptiveIcon: string;
  splash: string;
  easProjectId: string | undefined;
}

const VARIANTS: Record<AppVariant, VariantOverrides> = {
  consumer: {
    name: 'TruckTrack',
    slug: 'truck-track',
    scheme: 'trucktrack',
    iosBundleIdentifier: 'com.sainabdallah.trucktrack',
    androidPackage: 'com.sainabdallah.trucktrack',
    icon: './assets/icon-consumer.png',
    adaptiveIcon: './assets/adaptive-icon-consumer.png',
    splash: './assets/splash-consumer.png',
    easProjectId: 'f95c373e-bac6-42d7-b7cd-16e5c7ac3c70',
  },
  operator: {
    name: 'TruckTrack Ops',
    slug: 'truck-track-ops',
    scheme: 'trucktrackops',
    iosBundleIdentifier: 'com.sainabdallah.trucktrack.operator',
    androidPackage: 'com.sainabdallah.trucktrack.operator',
    icon: './assets/icon-operator.png',
    adaptiveIcon: './assets/adaptive-icon-operator.png',
    splash: './assets/splash-operator.png',
    // TODO: register a second Expo project for TruckTrack Ops in the Expo
    // dashboard, then paste its ID here before the first operator EAS build.
    easProjectId: 'c9f1fde6-4587-4b90-bd80-c4e6655407d4',
  },
};

function resolveVariant(): AppVariant {
  const raw = process.env.APP_VARIANT;
  if (raw === 'consumer' || raw === 'operator') return raw;
  if (raw === undefined || raw === '') {
    // Unset: local tool calls like bare `npx expo-doctor`. Default to consumer
    // so read-only diagnostics work without requiring the flag.
    return 'consumer';
  }
  throw new Error(
    `Invalid APP_VARIANT: ${String(raw)}. Expected 'consumer' or 'operator'. ` +
      `Use npm run start:consumer / start:operator or set APP_VARIANT explicitly.`,
  );
}

export default (): ExpoConfig => {
  const variant = resolveVariant();
  const v = VARIANTS[variant];

  // Street Fire palette literals — kept local so this config can be evaluated
  // by Node at build time without relying on the app's module resolver.
  const APP_BLACK = '#0F0F0F';

  return {
    name: v.name,
    slug: v.slug,
    scheme: v.scheme,
    version: '1.0.0',
    orientation: 'portrait',
    icon: v.icon,
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    splash: {
      image: v.splash,
      resizeMode: 'contain',
      backgroundColor: APP_BLACK,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: v.iosBundleIdentifier,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        // Tell iOS the app ships English + French resources so it picks
        // the right .lproj/InfoPlist.strings for OS-level dialogs (e.g.
        // the location permission prompt) based on device language.
        CFBundleDevelopmentRegion: 'en',
        CFBundleLocalizations: ['en', 'fr'],
        CFBundleAllowMixedLocalizations: true,
      },
    },
    android: {
      package: v.androidPackage,
      adaptiveIcon: {
        foregroundImage: v.adaptiveIcon,
        backgroundColor: APP_BLACK,
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    androidNavigationBar: {
      backgroundColor: APP_BLACK,
      barStyle: 'light-content',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    owner: 'sainabdallah',
    plugins: [
      'expo-font',
      'expo-localization',
      'expo-router',
      // @rnmapbox/maps' native build needs to download the Mapbox SDK from
      // their private artifact registry — that requires a secret token with
      // Downloads:Read scope, scoped per-build (NOT bundled with the JS).
      // The plugin reads the token from the RNMAPBOX_MAPS_DOWNLOAD_TOKEN
      // env var (set in .env.local for local prebuild + EAS Secret for
      // cloud builds). The deprecated `RNMapboxMapsDownloadToken` plugin
      // option is gone — env-var-only is the supported path.
      // The runtime public token (EXPO_PUBLIC_MAPBOX_TOKEN) is separate;
      // it's read by the app code at render time.
      '@rnmapbox/maps',
      // Foreground when-in-use only — we don't track location in the
      // background. The plugin wires NSLocationWhenInUseUsageDescription
      // on iOS and ACCESS_FINE_LOCATION + ACCESS_COARSE_LOCATION on
      // Android automatically. The English value here is the default /
      // base Info.plist string; the French translation lives in the
      // fr.lproj/InfoPlist.strings file that withLocalizedInfoPlist
      // writes at prebuild time.
      [
        'expo-location',
        {
          locationWhenInUsePermission: 'Find food trucks near you.',
        },
      ],
      // expo-image-picker — operator onboarding (TT-9) uploads a cover
      // photo via launchImageLibraryAsync. The plugin wires
      // NSPhotoLibraryUsageDescription on iOS automatically; the EN
      // string here is the base Info.plist value, FR comes through
      // withLocalizedInfoPlist below. Android needs no permission for
      // the system picker.
      [
        'expo-image-picker',
        {
          photosPermission: 'Pick a cover photo for your truck profile.',
        },
      ],
      [
        './plugins/withLocalizedInfoPlist',
        {
          locales: {
            en: {
              NSLocationWhenInUseUsageDescription: 'Find food trucks near you.',
              NSPhotoLibraryUsageDescription: 'Pick a cover photo for your truck profile.',
            },
            fr: {
              NSLocationWhenInUseUsageDescription: 'Trouvez des camions-restaurants près de vous.',
              NSPhotoLibraryUsageDescription:
                'Choisissez une photo de couverture pour le profil de votre camion.',
            },
          },
        },
      ],
    ],
    extra: {
      eas: v.easProjectId ? { projectId: v.easProjectId } : {},
      APP_VARIANT: variant,
    },
  };
};
