import { StyleSheet, View } from 'react-native';

import { MapView } from '@/components/map/MapView';
import { TruckPin } from '@/components/truck/TruckPin';
import { useTrucks } from '@/hooks/useTrucks';

export default function ConsumerMapScreen() {
  const { data: trucks = [] } = useTrucks();

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
