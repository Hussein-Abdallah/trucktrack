import Mapbox, { Camera, MapView as RNMapboxMapView } from '@rnmapbox/maps';
import { StyleSheet } from 'react-native';

// Public Mapbox token (pk.*). Read at module load so a missing/malformed
// token surfaces immediately on import, not at first render of a deep
// child screen. Matches the fail-loud pattern services/supabase.ts uses
// for its own env vars.
const PUBLIC_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';

if (!PUBLIC_TOKEN) {
  throw new Error(
    'EXPO_PUBLIC_MAPBOX_TOKEN is missing or empty. ' +
      'Add it to .env.local — see .env.example for the expected format.',
  );
}

if (PUBLIC_TOKEN.startsWith('sk.')) {
  // The secret download token (sk.*) is for the native build only and
  // must NEVER ship in the JS bundle. Catch the swap here loudly so we
  // fail at import instead of leaking a privileged token to every user.
  throw new Error(
    'EXPO_PUBLIC_MAPBOX_TOKEN looks like a secret token (sk.*). ' +
      'Use the public token (pk.*) here. The sk.* token belongs in ' +
      'RNMAPBOX_MAPS_DOWNLOAD_TOKEN (consumed by EAS Build, not bundled).',
  );
}

Mapbox.setAccessToken(PUBLIC_TOKEN);
// Suppress Mapbox's analytics pipeline — telemetry ships through PostHog
// per the architecture (CLAUDE.md). Idempotent + module-scoped so it fires
// once at import, not on every component mount.
Mapbox.setTelemetryEnabled(false);

// Ottawa city center — anchor every fresh launch here until the locate
// flow (TT-36) lands and recenters on the user.
const OTTAWA: [number, number] = [-75.6972, 45.4215];
const DEFAULT_ZOOM = 12;

// Mapbox's pre-built dark style is the closest match to Street Fire App
// Black without writing a custom style spec. A bespoke style is a future
// design polish ticket — this is the "good enough for MVP" baseline.
const DARK_STYLE = 'mapbox://styles/mapbox/dark-v11';

export function MapView() {
  return (
    <RNMapboxMapView
      style={styles.map}
      styleURL={DARK_STYLE}
      // logo + attribution stay enabled (Mapbox TOS §1.4 mandates both
      // for non-Enterprise accounts using Mapbox-hosted styles like
      // dark-v11). Disabling either is a real foot-gun — text alone is
      // not sufficient. Default position for both is bottom-left, which
      // sits cleanly under the future bottom sheet (TT-37) snap points.
      compassEnabled={false}
      scaleBarEnabled={false}
    >
      <Camera defaultSettings={{ centerCoordinate: OTTAWA, zoomLevel: DEFAULT_ZOOM }} />
    </RNMapboxMapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
