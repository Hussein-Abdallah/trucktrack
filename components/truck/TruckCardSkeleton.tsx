import { View } from 'react-native';

const COVER_SIZE = 80;

/**
 * Placeholder block matching TruckCard's exact layout — same 80×80
 * cover, name + badge row, tags row, meta row. Renders while
 * useTrucks (TT-35) is loading. Three of these in the bottom sheet
 * is the canonical loading shape (TT-39 wires that count).
 *
 * No shimmer animation yet — the static version is enough to signal
 * loading without pulling in Reanimated worklets purely for visual
 * polish. Animated shimmer is a follow-up if the static read feels
 * dead.
 */
export function TruckCardSkeleton() {
  return (
    <View className="w-full flex-row gap-4 border border-outline-100 bg-background-50 p-4">
      <View className="bg-background-200" style={{ width: COVER_SIZE, height: COVER_SIZE }} />
      <View className="flex-1 gap-2">
        <View className="flex-row items-start justify-between gap-2">
          <View className="h-5 flex-1 max-w-[60%] bg-background-200" />
          <View className="h-5 w-16 rounded-full bg-background-200" />
        </View>
        <View className="h-3 w-24 bg-background-200" />
        <View className="h-4 w-40 bg-background-200" />
      </View>
    </View>
  );
}
