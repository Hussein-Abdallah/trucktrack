import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, Text, View } from 'react-native';

import { Badge, BadgeText } from '@/components/ui/badge';
import type { AppLanguage, TruckWithSchedule } from '@/lib/types';
import { formatDistance } from '@/lib/utils';
import { MUTED } from '@/theme/colors';

interface TruckCardProps {
  truck: TruckWithSchedule;
  /** Optional — omitted when the user has no location permission. */
  distanceKm?: number;
  /** When true, render a fire-orange left accent + lighter background
   *  to indicate the card matches the currently-selected pin on the
   *  map. Selection state lives on the parent screen. */
  isSelected?: boolean;
  onPress?: () => void;
}

const ICON_SIZE = 14;
const COVER_SIZE = 80;

// Format a Postgres TIME (HH:MM:SS) as HH:MM for display. Locale-agnostic
// since 24-hour notation is standard in both en-CA and fr-CA.
function formatTime(time: string): string {
  return time.slice(0, 5);
}

export function TruckCard({ truck, distanceKm, isSelected = false, onPress }: TruckCardProps) {
  const { t, i18n } = useTranslation();
  // Distance formatter needs the locale for the en-CA / fr-CA decimal-
  // separator switch (Intl.NumberFormat). Labels come from t() — never
  // hardcoded — so dropping the locale prop in favour of i18n's own
  // language context keeps callers from having to thread it through.
  const locale: AppLanguage = i18n.language === 'fr' ? 'fr' : 'en';

  const todayHours = truck.schedule
    ? `${formatTime(truck.schedule.open_time)} – ${formatTime(truck.schedule.close_time)}`
    : null;

  return (
    <Pressable
      onPress={onPress}
      className={
        // Base card chrome stays identical between states; selection
        // adds a 4px fire-orange left accent + bumps the background
        // one shade lighter so the active row reads at a glance from
        // across the bottom sheet.
        isSelected
          ? 'w-full flex-row gap-4 border border-outline-100 border-l-4 border-l-primary-500 bg-background-100 p-4 active:bg-background-200'
          : 'w-full flex-row gap-4 border border-outline-100 bg-background-50 p-4 active:bg-background-100'
      }
    >
      {/* Cover image — fallback to a centered map-pin glyph when null. */}
      <View
        className="items-center justify-center bg-background-200"
        style={{ width: COVER_SIZE, height: COVER_SIZE }}
      >
        {truck.cover_url ? (
          <Image source={{ uri: truck.cover_url }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <Feather name="map-pin" size={24} color={MUTED} />
        )}
      </View>

      <View className="min-w-0 flex-1">
        {/* Name + status */}
        <View className="mb-1 flex-row items-start justify-between gap-2">
          <Text
            numberOfLines={1}
            className="flex-shrink font-heading text-lg tracking-wide text-typography-950"
          >
            {truck.name}
          </Text>
          <Badge action={truck.isOpen ? 'open' : 'closed'} size="sm">
            <BadgeText>{t(truck.isOpen ? 'truckCard.openNow' : 'truckCard.closed')}</BadgeText>
          </Badge>
        </View>

        {/* Cuisine tags */}
        {truck.cuisine_tags.length > 0 ? (
          <View className="mb-2 flex-row flex-wrap gap-x-2 gap-y-1">
            {truck.cuisine_tags.map((tag) => (
              <Text
                key={tag}
                className="font-mono text-[10px] uppercase tracking-[1.5px] text-typography-500"
              >
                {tag}
              </Text>
            ))}
          </View>
        ) : null}

        {/* Location + distance */}
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Feather name="map-pin" size={ICON_SIZE} color={MUTED} />
            <Text numberOfLines={1} className="font-body text-sm text-typography-500">
              {truck.schedule?.location_label ?? t('truckCard.unknownLocation')}
            </Text>
          </View>
          {distanceKm !== undefined ? (
            <Text className="font-mono-medium text-sm text-primary-500">
              {formatDistance(distanceKm, locale)}
            </Text>
          ) : null}
        </View>

        {/* Today's hours — only shown when there's a schedule today */}
        {todayHours ? (
          <View className="mt-1 flex-row items-center gap-1">
            <Feather name="clock" size={ICON_SIZE} color={MUTED} />
            <Text className="font-body text-sm text-typography-500">{todayHours}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
