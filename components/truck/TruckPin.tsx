import { Feather } from '@expo/vector-icons';
import { MarkerView } from '@rnmapbox/maps';
import { Pressable, StyleSheet, View } from 'react-native';

import type { TruckWithSchedule } from '@/lib/types';
import { FIRE_ORANGE, MUTED, WARM_CREAM } from '@/theme/colors';

interface TruckPinProps {
  truck: TruckWithSchedule;
  onPress: (truckId: string) => void;
}

const PIN_SIZE = 40;
const ICON_SIZE = 20;
const ARROW_HALF = 6;
const ARROW_HEIGHT = 8;
const TRANSPARENT = 'transparent';

export function TruckPin({ truck, onPress }: TruckPinProps) {
  // No schedule = no coordinates to anchor on. The inner join in
  // useTrucks means this branch shouldn't fire in practice; the guard
  // exists so the type system stays honest about the nullable shape.
  if (!truck.schedule) return null;

  const isOpen = truck.isOpen;

  return (
    <MarkerView
      coordinate={[truck.schedule.location_lng, truck.schedule.location_lat]}
      // Anchor the bottom (arrow tip) on the coordinate so the pin
      // visually points to the exact location instead of floating above.
      anchor={{ x: 0.5, y: 1 }}
      allowOverlap
    >
      <Pressable
        onPress={() => onPress(truck.id)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={truck.name}
      >
        <View style={isOpen ? styles.squareOpen : styles.squareClosed}>
          <Feather name="map-pin" size={ICON_SIZE} color={WARM_CREAM} />
        </View>
        <View style={isOpen ? styles.arrowOpen : styles.arrowClosed} />
      </Pressable>
    </MarkerView>
  );
}

// Pre-built per-state styles — keeps colours static so
// react-native/no-inline-styles + no-color-literals stay clean while
// preserving the open/closed visual swap. Each key is referenced
// directly in JSX above so no-unused-styles can see them.
const baseSquare = {
  width: PIN_SIZE,
  height: PIN_SIZE,
  alignItems: 'center',
  justifyContent: 'center',
} as const;

const baseArrow = {
  alignSelf: 'center',
  width: 0,
  height: 0,
  borderLeftWidth: ARROW_HALF,
  borderRightWidth: ARROW_HALF,
  borderTopWidth: ARROW_HEIGHT,
  borderLeftColor: TRANSPARENT,
  borderRightColor: TRANSPARENT,
} as const;

const styles = StyleSheet.create({
  squareOpen: { ...baseSquare, backgroundColor: FIRE_ORANGE },
  squareClosed: { ...baseSquare, backgroundColor: MUTED },
  arrowOpen: { ...baseArrow, borderTopColor: FIRE_ORANGE },
  arrowClosed: { ...baseArrow, borderTopColor: MUTED },
});
