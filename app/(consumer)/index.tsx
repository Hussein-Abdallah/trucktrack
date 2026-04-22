import { StyleSheet, View } from 'react-native';

import { MapView } from '@/components/map/MapView';
import { TruckPin } from '@/components/truck/TruckPin';
import { useTrucks } from '@/hooks/useTrucks';

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

  return (
    <View style={styles.container}>
      <MapView>
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
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
