import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, BadgeText } from '@/components/ui/badge';
import { deriveIsOpen } from '@/lib/schedule';
import type { AppLanguage, TruckWithSchedule } from '@/lib/types';
import { formatDistance } from '@/lib/utils';
import {
  APP_BLACK,
  CHARCOAL,
  CTA_WHITE,
  FIRE_ORANGE,
  GRAPHITE,
  MID,
  MUTED,
  SIGNAL_YELLOW,
  WARM_CREAM,
} from '@/theme/colors';

interface TruckSummaryProps {
  truck: TruckWithSchedule;
  /** Optional — undefined when the user has no location permission. */
  distanceKm?: number;
  onClose: () => void;
  onGetDirections: () => void;
  onViewDetails: () => void;
}

const ICON_SIZE = 16;
const HERO_HEIGHT = 140;
// Heart toggle below is local-only (no backend write). Kept as a
// visual placeholder per product direction so the summary card layout
// matches the design before the follows mutation lands. Follower
// count was removed entirely after CodeRabbit pushback — heart is
// the only "fake" element we kept since it's an interactive widget,
// not data presented as ground truth.

function formatTime(time: string): string {
  return time.slice(0, 5);
}

export function TruckSummary({
  truck,
  distanceKm,
  onClose,
  onGetDirections,
  onViewDetails,
}: TruckSummaryProps) {
  const { t, i18n } = useTranslation();
  const locale: AppLanguage = i18n.language === 'fr' ? 'fr' : 'en';
  // Local-only follow state — visual placeholder, no backend write.
  // When the follow ticket lands, this swaps to a Zustand/TanStack
  // mutation that toggles the follows table row.
  const [isFollowing, setIsFollowing] = useState(false);

  const todayHours = truck.schedule
    ? `${formatTime(truck.schedule.open_time)} – ${formatTime(truck.schedule.close_time)}`
    : null;
  const isOpen = deriveIsOpen(truck.schedule);

  return (
    <View style={styles.container}>
      {/* Hero image with overlay: heart top-left, X top-right, name bottom */}
      <View style={styles.hero}>
        {truck.cover_url ? (
          <Image source={{ uri: truck.cover_url }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={styles.heroFallback}>
            <Feather name="truck" size={48} color={MUTED} />
          </View>
        )}
        {/* Bottom-half darkening so the truck name reads against any
            cover photo — flat overlay, no gradient (no expo-linear-
            gradient dep needed and avoids the no-glow rule's gradient
            cousin). */}
        <View style={styles.heroDarkener} pointerEvents="none" />

        <Pressable
          onPress={() => setIsFollowing(!isFollowing)}
          style={styles.heroButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t(
            isFollowing
              ? 'routes.consumer.mapScreen.summary.unfollow'
              : 'routes.consumer.mapScreen.summary.follow',
          )}
        >
          <Feather name="heart" size={20} color={isFollowing ? FIRE_ORANGE : WARM_CREAM} />
        </Pressable>
        <Pressable
          onPress={onClose}
          style={styles.heroCloseButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('routes.consumer.mapScreen.closeSelection')}
        >
          <Feather name="x" size={20} color={WARM_CREAM} />
        </Pressable>

        <Text style={styles.heroName} numberOfLines={1}>
          {truck.name}
        </Text>
      </View>

      {/* Status + distance row */}
      <View style={styles.statusRow}>
        <Badge action={isOpen ? 'open' : 'closed'} size="sm">
          <BadgeText>{t(isOpen ? 'truckCard.openNow' : 'truckCard.closed')}</BadgeText>
        </Badge>
        {distanceKm !== undefined ? (
          <Text style={styles.distance}>{formatDistance(distanceKm, locale)}</Text>
        ) : null}
      </View>

      {/* Info card — info on the left, action buttons stacked on the right
          inside the same charcoal box so the layout reads as a single unit. */}
      <View style={styles.infoCard}>
        <View style={styles.infoColumn}>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={ICON_SIZE} color={MUTED} />
            <Text style={styles.infoText} numberOfLines={1}>
              {truck.schedule?.location_label ?? t('truckCard.unknownLocation')}
            </Text>
          </View>
          {todayHours ? (
            <View style={styles.infoRow}>
              <Feather name="clock" size={ICON_SIZE} color={MUTED} />
              <Text style={styles.infoText}>{todayHours}</Text>
            </View>
          ) : null}
          {truck.cuisine_tags.length > 0 || truck.catering_enabled ? (
            <View style={styles.tagsRow}>
              {truck.cuisine_tags.map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {truck.catering_enabled ? (
                <View style={styles.cateringChip}>
                  <Text style={styles.cateringText}>
                    {t('routes.consumer.mapScreen.summary.catering')}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.actionColumn}>
          {/* Layout via className (Pressable + StyleSheet flexDirection
              gets dropped under iOS Fabric — same quirk hit on
              LocateButton). Hex colours stay on style since they're
              not in the Tailwind palette. */}
          <Pressable
            onPress={onViewDetails}
            className="h-[38px] flex-row items-center justify-center gap-1 border px-1.5 active:opacity-70"
            style={{ backgroundColor: GRAPHITE, borderColor: MID }}
            accessibilityRole="button"
          >
            <Feather name="info" size={14} color={WARM_CREAM} />
            <Text style={styles.compactSecondaryText}>
              {t('routes.consumer.mapScreen.summary.viewDetails')}
            </Text>
          </Pressable>
          <Pressable
            onPress={onGetDirections}
            className="h-[38px] flex-row items-center justify-center gap-1 px-1.5 active:opacity-70"
            style={{ backgroundColor: FIRE_ORANGE }}
            accessibilityRole="button"
          >
            <Feather name="navigation" size={14} color={CTA_WHITE} />
            <Text style={styles.compactPrimaryText}>
              {t('routes.consumer.mapScreen.summary.getDirections')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  hero: {
    height: HERO_HEIGHT,
    backgroundColor: GRAPHITE,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: GRAPHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDarkener: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: APP_BLACK,
    opacity: 0.55,
  },
  heroButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CHARCOAL,
    borderWidth: 1,
    borderColor: MID,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCloseButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CHARCOAL,
    borderWidth: 1,
    borderColor: MID,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroName: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    fontFamily: 'BebasNeue',
    fontSize: 28,
    letterSpacing: 2,
    color: WARM_CREAM,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distance: {
    fontFamily: 'DMMono_Medium',
    fontSize: 12,
    letterSpacing: 1,
    color: FIRE_ORANGE,
    textTransform: 'uppercase',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: CHARCOAL,
    borderWidth: 1,
    borderColor: MID,
    padding: 12,
    gap: 12,
  },
  infoColumn: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  actionColumn: {
    width: 120,
    gap: 8,
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontFamily: 'DMSans',
    fontSize: 13,
    color: WARM_CREAM,
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: GRAPHITE,
  },
  tagText: {
    fontFamily: 'DMMono',
    fontSize: 10,
    letterSpacing: 1,
    color: MUTED,
    textTransform: 'uppercase',
  },
  cateringChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: SIGNAL_YELLOW,
  },
  cateringText: {
    fontFamily: 'DMMono_Medium',
    fontSize: 10,
    letterSpacing: 1,
    color: APP_BLACK,
    textTransform: 'uppercase',
  },
  // Pressable layout for the compact buttons lives on className above —
  // StyleSheet flexDirection/gap on a Pressable doesn't apply under iOS
  // Fabric. Text styling stays here since Text doesn't hit the same
  // quirk and the brand typography settings are easier to express in
  // StyleSheet than Tailwind arbitrary values.
  compactSecondaryText: {
    fontFamily: 'DMMono_Medium',
    fontSize: 10,
    letterSpacing: 1,
    color: WARM_CREAM,
    textTransform: 'uppercase',
  },
  compactPrimaryText: {
    fontFamily: 'DMMono_Medium',
    fontSize: 10,
    letterSpacing: 1,
    color: CTA_WHITE,
    textTransform: 'uppercase',
  },
});
