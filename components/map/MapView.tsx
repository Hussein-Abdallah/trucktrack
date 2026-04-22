import Mapbox, { Camera, MapView as RNMapboxMapView } from '@rnmapbox/maps';
import { useEffect } from 'react';
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
      'MAPBOX_DOWNLOADS_TOKEN (consumed by EAS Build, not bundled).',
  );
}

Mapbox.setAccessToken(PUBLIC_TOKEN);

// Ottawa city center — anchor every fresh launch here until the locate
// flow (TT-36) lands and recenters on the user.
const OTTAWA: [number, number] = [-75.6972, 45.4215];
const DEFAULT_ZOOM = 12;

// Mapbox's pre-built dark style is the closest match to Street Fire App
// Black without writing a custom style spec. A bespoke style is a future
// design polish ticket — this is the "good enough for MVP" baseline.
const DARK_STYLE = 'mapbox://styles/mapbox/dark-v11';

export function MapView() {
  useEffect(() => {
    // Suppress the "telemetry on by default" prompt — we ship analytics
    // through PostHog (see CLAUDE.md), not Mapbox's metrics pipeline.
    Mapbox.setTelemetryEnabled(false);
  }, []);

  return (
    <RNMapboxMapView
      style={styles.map}
      styleURL={DARK_STYLE}
      logoEnabled={false}
      attributionEnabled
      attributionPosition={{ bottom: 8, right: 8 }}
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
