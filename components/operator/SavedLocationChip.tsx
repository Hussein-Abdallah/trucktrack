import { Pressable, Text, View } from 'react-native';

import type { SavedLocation } from '@/lib/types';

interface SavedLocationChipProps {
  location: SavedLocation;
  isActive: boolean;
  onPress: () => void;
}

/**
 * Saved-location chip on the Today screen's 2-col grid. Active chip is
 * Fire Orange-filled (the selection signal); inactive is Charcoal +
 * Mid border. Sharp corners per CLAUDE.md — chips are buttons, the
 * pill exception is reserved for status badges.
 */
export function SavedLocationChip({ location, isActive, onPress }: SavedLocationChipProps) {
  const containerCls = isActive
    ? 'rounded-none bg-primary-400 p-3 active:opacity-80'
    : 'rounded-none border border-outline-200 bg-secondary-50 p-3 active:bg-secondary-100';
  const nameCls = isActive
    ? 'mb-1 font-mono-medium text-[10px] uppercase tracking-[1.5px] text-typography-white'
    : 'mb-1 font-mono-medium text-[10px] uppercase tracking-[1.5px] text-typography-950';
  // The chip is a button, so its secondary line follows the DM Mono
  // uppercase button-text convention from CLAUDE.md (not body copy).
  const labelCls = isActive
    ? 'font-mono-medium text-xs uppercase tracking-[1.5px] text-typography-white'
    : 'font-mono-medium text-xs uppercase tracking-[1.5px] text-typography-500';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${location.name}, ${location.location_label}`}
      className={containerCls}
    >
      <View>
        <Text className={nameCls} numberOfLines={1}>
          {location.name}
        </Text>
        <Text className={labelCls} numberOfLines={1}>
          {location.location_label}
        </Text>
      </View>
    </Pressable>
  );
}
