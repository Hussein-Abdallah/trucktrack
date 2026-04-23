import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MarkerView } from '@rnmapbox/maps';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { deriveIsOpen } from '@/lib/schedule';
import type { TruckWithSchedule } from '@/lib/types';
import { CHARCOAL, FIRE_ORANGE, MUTED, WARM_CREAM } from '@/theme/colors';

interface TruckPinProps {
  truck: TruckWithSchedule;
  /** True when this pin matches the screen's selectedTruckId. Drives
   *  the label rectangle's fill (orange when selected, charcoal when
   *  not). The square + arrow stay status-driven (open vs closed). */
  isSelected?: boolean;
  onPress: (truckId: string) => void;
}

const SQUARE_SIZE = 40;
// Fixed width so MarkerView's anchor math (which expects a stable
// view geometry) stays correct across pins regardless of name length.
// Long names truncate with an ellipsis; short names get a bit of
// empty space on the right — acceptable trade for stable positioning.
const LABEL_WIDTH = 120;
const TOTAL_WIDTH = SQUARE_SIZE + LABEL_WIDTH;
const ICON_SIZE = 24;
const ARROW_HALF = 6;
const ARROW_HEIGHT = 8;
const TRANSPARENT = 'transparent';
// Anchor at the bottom-center of the square (where the arrow tip sits)
// so the pin visually points at the geographic coordinate, not at the
// label's center.
const ANCHOR_X = SQUARE_SIZE / 2 / TOTAL_WIDTH;

export function TruckPin({ truck, isSelected = false, onPress }: TruckPinProps) {
  // No schedule = no coordinates to anchor on. The inner join in
  // useTrucks means this branch shouldn't fire in practice; the guard
  // exists so the type system stays honest about the nullable shape.
  if (!truck.schedule) return null;

  // Render-time derivation so the pin flips on the next render after
  // close_time passes — TT-40 realtime, focus, or any state change all
  // suffice to trigger that next render.
  const isOpen = deriveIsOpen(truck.schedule);

  return (
    <MarkerView
      coordinate={[truck.schedule.location_lng, truck.schedule.location_lat]}
      anchor={{ x: ANCHOR_X, y: 1 }}
      allowOverlap
    >
      <Pressable
        onPress={() => onPress(truck.id)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={truck.name}
      >
        <View style={styles.row}>
          {/* Square + arrow: status-driven (open = fire-orange, closed
              = muted). This is the pin's "anchor" half, so its color
              reads the truck's open/closed state at a glance even
              without selection. */}
          <View style={isOpen ? styles.iconBoxOpen : styles.iconBoxClosed}>
            <MaterialCommunityIcons name="truck" size={ICON_SIZE} color={WARM_CREAM} />
          </View>
          {/* Label: selection-driven (selected = fire-orange, default
              = charcoal). Independent from status so the user can
              spot which pin they tapped without losing the open/closed
              cue from the square. */}
          <View style={isSelected ? styles.labelSelected : styles.labelDefault}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.labelText}>
              {truck.name}
            </Text>
          </View>
        </View>
        {/* Arrow centered beneath the square only — points at the
            actual coordinate. Same status colour as the square so
            the anchor half stays visually unified. */}
        <View style={styles.arrowContainer}>
          <View style={isOpen ? styles.arrowOpen : styles.arrowClosed} />
        </View>
      </Pressable>
    </MarkerView>
  );
}

// Pre-built per-state styles — keeps colours static so
// react-native/no-inline-styles + no-color-literals stay clean.
// Each key is referenced directly in JSX above so no-unused-styles
// can see them.
const baseSquare = {
  width: SQUARE_SIZE,
  height: SQUARE_SIZE,
  alignItems: 'center',
  justifyContent: 'center',
} as const;

const baseLabel = {
  width: LABEL_WIDTH,
  height: SQUARE_SIZE,
  paddingHorizontal: 10,
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
  row: { flexDirection: 'row' },
  iconBoxOpen: { ...baseSquare, backgroundColor: FIRE_ORANGE },
  iconBoxClosed: { ...baseSquare, backgroundColor: MUTED },
  labelSelected: { ...baseLabel, backgroundColor: FIRE_ORANGE },
  labelDefault: { ...baseLabel, backgroundColor: CHARCOAL },
  labelText: {
    fontFamily: 'DMSans_Medium',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: WARM_CREAM,
  },
  arrowContainer: {
    width: SQUARE_SIZE,
    alignItems: 'center',
  },
  arrowOpen: { ...baseArrow, borderTopColor: FIRE_ORANGE },
  arrowClosed: { ...baseArrow, borderTopColor: MUTED },
});
