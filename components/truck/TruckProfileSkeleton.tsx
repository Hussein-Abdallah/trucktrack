import { View } from 'react-native';

/**
 * Static placeholder for the truck profile screen while
 * useTruckProfile (TT-45) is loading. Matches the rough shape
 * TT-46 / TT-47 will deliver — hero block, cuisine row, today's
 * schedule heading + 2 shift cards, concept heading + body — so
 * the layout doesn't jump on hydration.
 *
 * No shimmer animation — same static convention as
 * TruckCardSkeleton. TT-47 will refine layout fidelity + a11y.
 */
export function TruckProfileSkeleton() {
  return (
    <View className="flex-1 bg-background-0">
      <View className="h-72 bg-background-100" />
      <View className="gap-4 px-4 pt-6">
        <View className="flex-row gap-2">
          <View className="h-5 w-20 bg-background-200" />
          <View className="h-5 w-16 bg-background-200" />
          <View className="h-5 w-24 bg-background-200" />
        </View>
        <View className="h-6 w-40 bg-background-200" />
        <View className="h-20 bg-background-100" />
        <View className="h-20 bg-background-100" />
        <View className="mt-2 h-6 w-32 bg-background-200" />
        <View className="h-3 bg-background-200" />
        <View className="h-3 w-3/4 bg-background-200" />
      </View>
    </View>
  );
}
