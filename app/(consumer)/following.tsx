import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/shared/EmptyState';
import { TruckCardSkeleton } from '@/components/truck/TruckCardSkeleton';
import { TruckFeedCard } from '@/components/truck/TruckFeedCard';
import { useFollowedTrucks } from '@/hooks/useFollowedTrucks';
import { deriveIsOpen } from '@/lib/schedule';
import type { TruckWithSchedule } from '@/lib/types';
import { haversineKm, openMapsDirections } from '@/lib/utils';
import { useLocationStore } from '@/stores/locationStore';
import { APP_BLACK, MUTED, WARM_CREAM } from '@/theme/colors';

const SKELETON_COUNT = 3;
const SKELETON_KEYS = Array.from({ length: SKELETON_COUNT }, (_, i) => `follow-skel-${i}`);

interface SortedTruck {
  truck: TruckWithSchedule;
  /** Distance to the user in km. Undefined when no location permission. */
  distanceKm: number | undefined;
  /** Cached isOpen so the sort and the badge derive from the same
   *  wall-clock snapshot for this render. */
  isOpen: boolean;
}

export default function FollowingScreen() {
  const { t, i18n } = useTranslation();
  const { data: trucks = [], isLoading, isRefetching, error, refetch } = useFollowedTrucks();
  const coords = useLocationStore((s) => s.coords);

  // Refetch when the user returns to this tab — covers the "follow on
  // truck profile, switch back to Following" path. Realtime on
  // truck_schedules covers schedule changes; this covers follow-row
  // changes that aren't in the realtime publication today.
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  // Sort spec (locked):
  // 1. Open trucks first, closed after.
  // 2. Within each group, ascending by distance when coords are
  //    available.
  // 3. Tie-break / no-coords fallback: alphabetical by name in the
  //    current locale.
  const sortedTrucks = useMemo<SortedTruck[]>(() => {
    const items = trucks.map<SortedTruck>((truck) => ({
      truck,
      isOpen: deriveIsOpen(truck.schedule),
      distanceKm:
        coords && truck.schedule
          ? haversineKm(coords, {
              lat: truck.schedule.location_lat,
              lng: truck.schedule.location_lng,
            })
          : undefined,
    }));
    return items.sort((a, b) => {
      if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
      const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
      const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
      if (da !== db) return da - db;
      return a.truck.name.localeCompare(b.truck.name, i18n.language);
    });
  }, [trucks, coords, i18n.language]);

  const handleCardPress = (id: string) => {
    router.push(`/truck/${id}`);
  };

  const handleExploreMap = () => {
    // Replace, not push — sibling tab, no back-stack breadcrumb needed.
    router.replace('/(consumer)');
  };

  const renderBody = () => {
    if (error) {
      return (
        <EmptyState
          icon="alert-triangle"
          title={t('routes.consumer.followingScreen.errorTitle')}
          message={t('routes.consumer.followingScreen.errorMessage')}
        />
      );
    }
    if (isLoading) {
      return (
        <View style={styles.skeletonStack}>
          {SKELETON_KEYS.map((key) => (
            <TruckCardSkeleton key={key} />
          ))}
        </View>
      );
    }
    if (sortedTrucks.length === 0) {
      return (
        <EmptyState
          icon="heart"
          title={t('routes.consumer.followingScreen.emptyTitle')}
          message={t('routes.consumer.followingScreen.emptyMessage')}
          actionLabel={t('routes.consumer.followingScreen.emptyAction')}
          onAction={handleExploreMap}
        />
      );
    }
    return (
      <FlatList
        data={sortedTrucks}
        keyExtractor={(item) => item.truck.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={WARM_CREAM}
          />
        }
        renderItem={({ item }) => {
          const sched = item.truck.schedule;
          // Per-card CTA only when there's a place to direct to. For
          // trucks with no schedule today, the card itself still
          // navigates to the profile on tap.
          const directionsHandler = sched
            ? () =>
                void openMapsDirections({
                  lat: sched.location_lat,
                  lng: sched.location_lng,
                  label: item.truck.name,
                })
            : undefined;
          return (
            <TruckFeedCard
              truck={item.truck}
              distanceKm={item.distanceKm}
              onPress={() => handleCardPress(item.truck.id)}
              actionLabel={directionsHandler ? t('truckCard.getDirections') : undefined}
              onAction={directionsHandler}
            />
          );
        }}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('routes.consumer.following')}</Text>
        <Text style={styles.subtitle}>{t('routes.consumer.followingScreen.subtitle')}</Text>
      </View>
      {renderBody()}
    </SafeAreaView>
  );
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_BLACK },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 4,
  },
  title: {
    fontFamily: 'BebasNeue',
    fontSize: 28,
    letterSpacing: 2,
    color: WARM_CREAM,
  },
  subtitle: {
    fontFamily: 'DMMono',
    fontSize: 11,
    letterSpacing: 1.5,
    color: MUTED,
  },
  skeletonStack: {
    paddingHorizontal: 16,
    gap: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  separator: {
    height: 16,
  },
});
