import { Camera } from '@rnmapbox/maps';
import { useEffect, useRef } from 'react';
import { AppState, Linking, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LocateButton } from '@/components/map/LocateButton';
import { DEFAULT_ZOOM, MapView, OTTAWA_CENTER, USER_ZOOM } from '@/components/map/MapView';
import { UserLocationDot } from '@/components/map/UserLocationDot';
import { TruckPin } from '@/components/truck/TruckPin';
import { useTrucks } from '@/hooks/useTrucks';
import { useLocationStore } from '@/stores/locationStore';
import { APP_BLACK } from '@/theme/colors';

const CAMERA_FLY_MS = 600;

export default function ConsumerMapScreen() {
  // Loading / empty / error UX (skeletons + retry CTA on the bottom
  // sheet) is intentionally deferred to TT-39 — the integration ticket
  // that wires the bottom sheet, card list, and surface-level chrome.
  // For TT-35 we render whatever pins the hook has and at least surface
  // fetch failures to the dev console so they aren't swallowed silently
  // (Sentry hookup is a separate ticket).
  const { data: trucks = [], error } = useTrucks();
  if (error) {
    // eslint-disable-next-line no-console
    console.error('[useTrucks] fetch failed:', error);
  }

  const permissionStatus = useLocationStore((s) => s.permissionStatus);
  const coords = useLocationStore((s) => s.coords);
  const cameraRef = useRef<Camera>(null);
  // Top inset = device safe-area top (notch / Dynamic Island) plus a
  // visual margin so the locate button doesn't sit flush against the
  // system chrome. Hardcoding 20 only worked on devices where the safe
  // area top is < 20pt, which excludes anything with a notch.
  const insets = useSafeAreaInsets();

  // Permission lifecycle: prompt on first mount, re-sync on app resume
  // (handles user toggling location in Settings while backgrounded),
  // tear down the watch on unmount so the GPS subscription doesn't leak.
  useEffect(() => {
    const {
      permissionStatus: current,
      requestPermission,
      refresh,
      teardown,
    } = useLocationStore.getState();

    if (current === 'undetermined') {
      void requestPermission();
    } else if (current === 'granted') {
      void refresh();
    }

    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      // requestPermission() is a no-op prompt when status is already
      // determined — it just re-reads the OS state. That's exactly the
      // resync we want here.
      void useLocationStore.getState().requestPermission();
    });

    return () => {
      sub.remove();
      teardown();
    };
  }, []);

  const locateDisabled = permissionStatus !== 'granted' || !coords;

  const handleLocate = () => {
    if (permissionStatus === 'denied') {
      // The OS won't re-prompt after a denial — only Settings can flip
      // it. Send the user there directly so they have a recovery path.
      void Linking.openSettings();
      return;
    }
    if (!coords) return;
    cameraRef.current?.setCamera({
      centerCoordinate: [coords.lng, coords.lat],
      zoomLevel: USER_ZOOM,
      animationDuration: CAMERA_FLY_MS,
      animationMode: 'flyTo',
    });
  };

  return (
    <View style={styles.container}>
      <MapView>
        <Camera
          ref={cameraRef}
          defaultSettings={{ centerCoordinate: OTTAWA_CENTER, zoomLevel: DEFAULT_ZOOM }}
        />
        {trucks.map((truck) => (
          <TruckPin
            key={truck.id}
            truck={truck}
            onPress={(id) => {
              // Pin tap navigation lands in TT-39 (map screen wire-up).
              // Logging the id is the AC for this ticket.
              // eslint-disable-next-line no-console
              console.log('truck pin tapped:', id);
            }}
          />
        ))}
        {coords ? <UserLocationDot coords={coords} /> : null}
      </MapView>
      {/* Overlay covers the full container so the LocateButton has a
          known, full-screen frame. Flexbox (alignItems: 'flex-end' +
          paddingTop) handles the actual top-right positioning instead
          of absolute offsets on the button itself — that combo runs
          into a Fabric quirk where Pressable's top/right collapse to
          0/0 inside an absolute-fill parent. pointerEvents="box-none"
          lets touches fall through to the map below. */}
      <View
        style={[styles.overlay, { paddingTop: insets.top + OVERLAY_TOP_MARGIN }]}
        pointerEvents="box-none"
      >
        <LocateButton disabled={locateDisabled} onPress={handleLocate} />
      </View>
    </View>
  );
}

// Visual margin between the safe-area top edge and the locate button.
// Combined with insets.top at render time so the button clears the
// notch / Dynamic Island on every device.
const OVERLAY_TOP_MARGIN = 20;
const OVERLAY_RIGHT_INSET = 20;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_BLACK },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    paddingRight: OVERLAY_RIGHT_INSET,
  },
});
