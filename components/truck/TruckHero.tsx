import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, BadgeText } from '@/components/ui/badge';
import type { Truck } from '@/lib/types';
import { GRAPHITE, MUTED } from '@/theme/colors';

interface TruckHeroProps {
  truck: Truck;
  isOpen: boolean;
}

const HERO_HEIGHT = 288; // h-72 in NativeWind tokens
const FALLBACK_ICON_SIZE = 48;
// Generic dark blurhash — used when expo-image is fetching a real cover
// or as a static placeholder while transition: 200 fades it in. Picked
// to read close to the App Black / Graphite surface so there's no flash.
const COVER_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

export function TruckHero({ truck, isOpen }: TruckHeroProps) {
  const { t } = useTranslation();
  const statusKey = isOpen ? 'truckCard.openNow' : 'truckCard.closed';

  return (
    <View style={{ height: HERO_HEIGHT }} className="relative bg-background-100">
      {truck.cover_url ? (
        <Image
          source={{ uri: truck.cover_url }}
          placeholder={{ blurhash: COVER_BLURHASH }}
          contentFit="cover"
          transition={200}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: GRAPHITE }]}
          className="items-center justify-center"
        >
          <Feather name="map-pin" size={FALLBACK_ICON_SIZE} color={MUTED} />
        </View>
      )}
      {/* Bottom-darkening gradient so the name + cuisine chips stay
          readable over arbitrary photos. App Black at the bottom edge,
          fully transparent at the top so the badge area shows the
          underlying image. */}
      <LinearGradient
        colors={['transparent', 'rgba(15,15,15,0.5)', '#0F0F0F']}
        style={StyleSheet.absoluteFill}
      />
      <View className="absolute left-0 right-0 top-20 items-center">
        <Badge action={isOpen ? 'open' : 'closed'} size="sm">
          <BadgeText>{t(statusKey)}</BadgeText>
        </Badge>
      </View>
      <View className="absolute bottom-4 left-0 right-0 px-4">
        <Text className="text-center font-heading text-4xl tracking-wider text-typography-950">
          {truck.name}
        </Text>
        {truck.cuisine_tags.length > 0 ? (
          <View className="mt-3 flex-row flex-wrap justify-center gap-2">
            {truck.cuisine_tags.map((tag) => (
              <View key={tag} className="bg-background-100 px-3 py-1">
                <Text className="font-mono text-[10px] uppercase tracking-[1.5px] text-typography-500">
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}
