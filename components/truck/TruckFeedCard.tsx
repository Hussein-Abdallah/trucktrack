import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, Text, View } from 'react-native';

import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';
import { deriveIsOpen } from '@/lib/schedule';
import type { AppLanguage, TruckWithSchedule } from '@/lib/types';
import { formatDistance } from '@/lib/utils';
import { MUTED } from '@/theme/colors';

const HERO_HEIGHT = 200;

interface TruckFeedCardProps {
  truck: TruckWithSchedule;
  /** Distance to the user in km. Omitted when no location permission. */
  distanceKm?: number;
  /** Whole-card press — typically navigates to the truck profile. */
  onPress?: () => void;
  /** Optional CTA pair. Both must be set for the per-card button to
   *  render (e.g. "GET DIRECTIONS" when the truck has a today's
   *  location). When omitted, the card body ends after the location. */
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Rich follow-feed card matching the design: hero cover image with
 * status + distance pinned to the top-right, truck name, today's
 * location label + value, optional primary CTA. Distinct from the
 * compact `TruckCard` used in the map bottom sheet (visual weight
 * matches the design's intent for each surface).
 */
export function TruckFeedCard({
  truck,
  distanceKm,
  onPress,
  actionLabel,
  onAction,
}: TruckFeedCardProps) {
  const { t, i18n } = useTranslation();
  const locale: AppLanguage = i18n.language === 'fr' ? 'fr' : 'en';
  const isOpen = deriveIsOpen(truck.schedule);
  const showAction = actionLabel !== undefined && onAction !== undefined;

  return (
    <Pressable
      onPress={onPress}
      className="w-full border border-outline-100 bg-background-50 active:bg-background-100"
    >
      {/* Hero */}
      <View style={{ height: HERO_HEIGHT }} className="relative">
        {truck.cover_url ? (
          <Image source={{ uri: truck.cover_url }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center bg-background-200">
            <Feather name="map-pin" size={32} color={MUTED} />
          </View>
        )}
        {/* Top-right status + distance stack */}
        <View className="absolute right-3 top-3 items-end gap-2">
          <Badge action={isOpen ? 'open' : 'closed'} size="md">
            <BadgeText>{t(isOpen ? 'truckCard.openNow' : 'truckCard.closed')}</BadgeText>
          </Badge>
          {distanceKm !== undefined ? (
            <View className="bg-background-0/85 px-3 py-1">
              <Text className="font-mono-medium text-sm text-typography-950">
                {formatDistance(distanceKm, locale)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Body */}
      <View className="gap-3 p-4">
        <Text
          numberOfLines={2}
          className="font-heading text-2xl tracking-wider text-typography-950"
        >
          {truck.name}
        </Text>

        <View className="gap-1">
          <Text className="font-mono text-[10px] uppercase tracking-[1.5px] text-typography-500">
            {t('truckCard.todaysLocation')}
          </Text>
          <Text numberOfLines={2} className="font-body text-base text-typography-950">
            {truck.schedule?.location_label ?? t('truckCard.unknownLocation')}
          </Text>
        </View>

        {showAction ? (
          <Button action="primary" size="lg" onPress={onAction}>
            <ButtonText>{actionLabel}</ButtonText>
          </Button>
        ) : null}
      </View>
    </Pressable>
  );
}
