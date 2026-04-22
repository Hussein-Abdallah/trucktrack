import { Feather } from '@expo/vector-icons';
import type GorhomBottomSheet from '@gorhom/bottom-sheet';
import { Camera } from '@rnmapbox/maps';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BottomSheetFlatListMethods } from '@/components/map/BottomSheet';
import { BottomSheet, BottomSheetFlatList } from '@/components/map/BottomSheet';
import { LocateButton } from '@/components/map/LocateButton';
import { DEFAULT_ZOOM, MapView, OTTAWA_CENTER, USER_ZOOM } from '@/components/map/MapView';
import { UserLocationDot } from '@/components/map/UserLocationDot';
import { EmptyState } from '@/components/shared/EmptyState';
import { TruckCard } from '@/components/truck/TruckCard';
import { TruckCardSkeleton } from '@/components/truck/TruckCardSkeleton';
import { TruckPin } from '@/components/truck/TruckPin';
import { Badge, BadgeText } from '@/components/ui/badge';
import { useTrucks } from '@/hooks/useTrucks';
import type { TruckWithSchedule } from '@/lib/types';
import { haversineKm } from '@/lib/utils';
import { useLocationStore } from '@/stores/locationStore';
import { APP_BLACK, FIRE_ORANGE, MID, WARM_CREAM } from '@/theme/colors';

const CAMERA_FLY_MS = 600;
// BottomSheet snap-point indices in the default ['peek','half','full'] order.
const SNAP_PEEK = 0;
const SNAP_HALF = 1;
const SNAP_FULL = 2;
const SKELETON_COUNT = 3;
const SKELETON_KEYS = Array.from({ length: SKELETON_COUNT }, (_, i) => `truck-skel-${i}`);

interface SortedTruck {
  truck: TruckWithSchedule;
  /** Distance to the user in km. Undefined when no location permission. */
  distanceKm: number | undefined;
}

function snapToIndex(snap: 'peek' | 'half' | 'full'): number {
  if (snap === 'peek') return SNAP_PEEK;
  if (snap === 'half') return SNAP_HALF;
  return SNAP_FULL;
}

export default function ConsumerMapScreen() {
  const { t } = useTranslation();
  const { data: trucks = [], isLoading, error } = useTrucks();
  if (error) {
    // eslint-disable-next-line no-console
    console.error('[useTrucks] fetch failed:', error);
  }

  const permissionStatus = useLocationStore((s) => s.permissionStatus);
  const coords = useLocationStore((s) => s.coords);
  const cameraRef = useRef<Camera>(null);
  const sheetRef = useRef<GorhomBottomSheet>(null);
  const sheetIndexRef = useRef(SNAP_HALF);
  const listRef = useRef<BottomSheetFlatListMethods>(null);
  // insets.top combined with a visual margin so overlays clear the
  // notch / Dynamic Island on every device.
  const insets = useSafeAreaInsets();

  // Permission lifecycle: prompt on first mount, re-sync on app resume
  // (handles user toggling location in Settings while backgrounded),
  // tear down the watch on unmount so the GPS subscription doesn't leak.
  useEffect(() => {
    const {
      permissionStatus: current,
      requestPermission,
      refresh,
      teardown,
    } = useLocationStore.getState();

    if (current === 'undetermined') {
      void requestPermission();
    } else if (current === 'granted') {
      void refresh();
    }

    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      // requestPermission is a no-op prompt when status is determined —
      // it just re-reads the OS state, which is exactly the resync we
      // want when returning from Settings.
      void useLocationStore.getState().requestPermission();
    });

    return () => {
      sub.remove();
      teardown();
    };
  }, []);

  // Sort by distance when we have coords, else by name. Memoized so the
  // FlatList sees a stable array identity across renders.
  const sortedTrucks = useMemo<SortedTruck[]>(() => {
    if (coords) {
      return trucks
        .map<SortedTruck>((truck) => ({
          truck,
          distanceKm: truck.schedule
            ? haversineKm(coords, {
                lat: truck.schedule.location_lat,
                lng: truck.schedule.location_lng,
              })
            : undefined,
        }))
        .sort((a, b) => {
          const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
          const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
          return da - db;
        });
    }
    return [...trucks]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map<SortedTruck>((truck) => ({ truck, distanceKm: undefined }));
  }, [trucks, coords]);

  const openCount = useMemo(() => trucks.filter((tr) => tr.isOpen).length, [trucks]);

  const permissionDenied = permissionStatus === 'denied';
  const isLocating = permissionStatus === 'granted' && !coords;

  const handlePinPress = (id: string) => {
    const truck = trucks.find((tr) => tr.id === id);
    if (!truck?.schedule) return;
    cameraRef.current?.setCamera({
      centerCoordinate: [truck.schedule.location_lng, truck.schedule.location_lat],
      zoomLevel: USER_ZOOM,
      animationDuration: CAMERA_FLY_MS,
      animationMode: 'flyTo',
    });
    // Snap to half if currently at peek so the user sees the matching
    // card. If they're at full, leave them there — they're browsing.
    if (sheetIndexRef.current === SNAP_PEEK) {
      sheetRef.current?.snapToIndex(SNAP_HALF);
    }
    const idx = sortedTrucks.findIndex((s) => s.truck.id === id);
    if (idx >= 0) {
      try {
        listRef.current?.scrollToIndex({ index: idx, animated: true });
      } catch {
        // scrollToIndex throws if the row isn't measured yet; the scroll
        // is polish, not a contract — better to miss it than crash.
      }
    }
  };

  const handleCardPress = (id: string) => {
    router.push(`/truck/${id}`);
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const handleLocate = () => {
    if (permissionDenied) {
      void Linking.openSettings();
      return;
    }
    if (!coords) return;
    cameraRef.current?.setCamera({
      centerCoordinate: [coords.lng, coords.lat],
      zoomLevel: USER_ZOOM,
      animationDuration: CAMERA_FLY_MS,
      animationMode: 'flyTo',
    });
  };

  // Sheet body switches between four states. Extracted so the JSX tree
  // doesn't grow a banned nested ternary chain.
  const renderSheetBody = (): ReactNode => {
    if (error) {
      return (
        <EmptyState
          icon="alert-triangle"
          title={t('routes.consumer.mapScreen.errorTitle')}
          message={t('routes.consumer.mapScreen.errorMessage')}
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
          icon="calendar"
          title={t('routes.consumer.mapScreen.emptyTitle')}
          message={t('routes.consumer.mapScreen.emptyMessage')}
        />
      );
    }
    return (
      <BottomSheetFlatList
        ref={listRef}
        data={sortedTrucks}
        keyExtractor={(item) => item.truck.id}
        renderItem={({ item }) => (
          <TruckCard
            truck={item.truck}
            distanceKm={item.distanceKm}
            onPress={() => handleCardPress(item.truck.id)}
          />
        )}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <View style={styles.container}>
      <MapView>
        <Camera
          ref={cameraRef}
          defaultSettings={{ centerCoordinate: OTTAWA_CENTER, zoomLevel: DEFAULT_ZOOM }}
        />
        {trucks.map((truck) => (
          <TruckPin key={truck.id} truck={truck} onPress={handlePinPress} />
        ))}
        {coords ? <UserLocationDot coords={coords} /> : null}
      </MapView>

      {/* Top-bar overlay: wordmark left, profile button right. Lives in
          its own absolute-positioned bar with pointerEvents="box-none"
          so the map underneath stays interactive. */}
      <View
        style={[styles.topBar, { paddingTop: insets.top + TOP_BAR_MARGIN }]}
        pointerEvents="box-none"
      >
        <Text style={styles.wordmark}>{t('routes.consumer.mapScreen.wordmark')}</Text>
        <Pressable
          onPress={handleProfilePress}
          accessibilityRole="button"
          accessibilityLabel={t('routes.consumer.profile')}
          style={styles.profileButton}
        >
          <Feather name="user" size={20} color={WARM_CREAM} />
        </Pressable>
      </View>

      {/* Locate-button overlay sits below the top bar (right side). */}
      <View
        style={[styles.locateOverlay, { paddingTop: insets.top + LOCATE_TOP_OFFSET }]}
        pointerEvents="box-none"
      >
        <LocateButton
          permissionDenied={permissionDenied}
          isLocating={isLocating}
          onPress={handleLocate}
        />
      </View>

      <BottomSheet
        ref={sheetRef}
        initialSnap="half"
        onSnapChange={(snap) => {
          sheetIndexRef.current = snapToIndex(snap);
        }}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{t('routes.consumer.mapScreen.nearbyTrucks')}</Text>
          <Badge action="accent" size="sm">
            <BadgeText>
              {t('routes.consumer.mapScreen.openNowCount', { count: openCount })}
            </BadgeText>
          </Badge>
        </View>

        {renderSheetBody()}
      </BottomSheet>
    </View>
  );
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

const TOP_BAR_MARGIN = 12;
const LOCATE_TOP_OFFSET = 72;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_BLACK },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  wordmark: {
    fontFamily: 'BebasNeue',
    fontSize: 24,
    letterSpacing: 2,
    color: FIRE_ORANGE,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: MID,
    backgroundColor: APP_BLACK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontFamily: 'BebasNeue',
    fontSize: 20,
    letterSpacing: 2,
    color: WARM_CREAM,
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
    height: 8,
  },
});
