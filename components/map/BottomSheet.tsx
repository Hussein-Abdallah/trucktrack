import GorhomBottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { forwardRef, useMemo } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { CHARCOAL, MID } from '@/theme/colors';

export type SnapPoint = 'peek' | 'half' | 'full';

interface BottomSheetProps {
  /** Defaults to ['peek', 'half', 'full']. Order matters — index 0 is the lowest snap. */
  snapPoints?: SnapPoint[];
  /** Defaults to 'half'. Must be a member of `snapPoints` if provided. */
  initialSnap?: SnapPoint;
  /** Fires when the user drags or programmatic snap settles on a new point. */
  onSnapChange?: (snap: SnapPoint) => void;
  children: ReactNode;
}

// Snap-point heights. Match the design ref — peek shows just the header,
// half is the canonical resting state on the map screen, full is for
// browse-the-list mode. Strings are read by @gorhom/bottom-sheet as
// either px values or % of screen.
const SNAP_HEIGHTS: Record<SnapPoint, string> = {
  peek: '24%',
  half: '50%',
  full: '85%',
};

/**
 * Project-styled wrapper around @gorhom/bottom-sheet. Exists so every
 * map screen using a sheet picks up the same snap points, drag handle,
 * background, and sharp 4px top corners (modal-radius rule from
 * CLAUDE.md) without re-deriving them.
 *
 * Forwards a ref to the underlying GorhomBottomSheet so callers can
 * imperatively snap (`ref.current?.snapToIndex(2)`) — TT-39 wires the
 * map screen to snap-to-half when a pin is tapped at peek.
 */
export const BottomSheet = forwardRef<GorhomBottomSheet, BottomSheetProps>(function BottomSheet(
  { snapPoints, initialSnap, onSnapChange, children },
  ref,
) {
  // Memoise both the resolved snap-point array and its source-point list.
  // @gorhom/bottom-sheet warns if snapPoints changes identity between
  // renders even when values are equal — and the default-fallback array
  // here is recreated every render unless wrapped.
  const points = useMemo<readonly SnapPoint[]>(
    () => snapPoints ?? ['peek', 'half', 'full'],
    [snapPoints],
  );
  const resolvedSnapPoints = useMemo(() => points.map((p) => SNAP_HEIGHTS[p]), [points]);
  const initial = initialSnap ?? 'half';
  const initialIndex = points.indexOf(initial);

  return (
    <GorhomBottomSheet
      ref={ref}
      snapPoints={resolvedSnapPoints}
      index={initialIndex}
      backgroundStyle={styles.background}
      handleStyle={styles.handle}
      handleIndicatorStyle={styles.handleIndicator}
      onChange={(idx) => {
        if (idx >= 0 && idx < points.length) onSnapChange?.(points[idx]);
      }}
    >
      {children}
    </GorhomBottomSheet>
  );
});

export { BottomSheetScrollView };

const styles = StyleSheet.create({
  background: {
    backgroundColor: CHARCOAL,
    // Sharp-ish modal corners per CLAUDE.md shape rules.
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderTopWidth: 1,
    borderColor: MID,
    // Explicitly no shadow / blur / glow per the same rules.
  },
  handle: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  handleIndicator: {
    backgroundColor: MID,
    width: 40,
    height: 4,
    borderRadius: 2, // pill on the handle itself is fine — it's not a button
  },
});
