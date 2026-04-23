import { Feather } from '@expo/vector-icons';
import type GorhomBottomSheet from '@gorhom/bottom-sheet';
import { Camera } from '@rnmapbox/maps';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Linking, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BottomSheet,
  BottomSheetFlatList,
  BottomSheetScrollView,
} from '@/components/map/BottomSheet';
import { LocateButton } from '@/components/map/LocateButton';
import { DEFAULT_ZOOM, MapView, OTTAWA_CENTER, USER_ZOOM } from '@/components/map/MapView';
import { UserLocationDot } from '@/components/map/UserLocationDot';
import { EmptyState } from '@/components/shared/EmptyState';
import { TruckCard } from '@/components/truck/TruckCard';
import { TruckCardSkeleton } from '@/components/truck/TruckCardSkeleton';
import { TruckPin } from '@/components/truck/TruckPin';
import { TruckSummary } from '@/components/truck/TruckSummary';
import { Badge, BadgeText } from '@/components/ui/badge';
import { useTrucks } from '@/hooks/useTrucks';
import { deriveIsOpen } from '@/lib/schedule';
import type { TruckWithSchedule } from '@/lib/types';
import { haversineKm, openMapsDirections } from '@/lib/utils';
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
  const { t, i18n } = useTranslation();
  const { data: trucks = [], isLoading, isRefetching, error, refetch } = useTrucks();
  if (error) {
    // eslint-disable-next-line no-console
    console.error('[useTrucks] fetch failed:', error);
  }

  const permissionStatus = useLocationStore((s) => s.permissionStatus);
  const coords = useLocationStore((s) => s.coords);
  const cameraRef = useRef<Camera>(null);
  const sheetRef = useRef<GorhomBottomSheet>(null);
  const sheetIndexRef = useRef(SNAP_HALF);
  // Snap the user was on right before entering selection mode.
  // Captured on the first pin tap and restored on close X so dismissing
  // the summary returns the sheet to where it was, instead of always
  // forcing it back to half.
  const preSelectionSnapRef = useRef<number | null>(null);
  // Currently-selected pin/card. Set on pin tap, cleared by the close
  // X. Drives both the sheet body (single focused card vs. full list)
  // and the selected-card highlight.
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
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
      .sort((a, b) => a.name.localeCompare(b.name, i18n.language))
      .map<SortedTruck>((truck) => ({ truck, distanceKm: undefined }));
  }, [trucks, coords, i18n.language]);

  // Inline (no useMemo) so the count stays consistent with TruckPin /
  // TruckCard / TruckSummary, which all derive isOpen at render. Memoising
  // on [trucks] would cache a stale count across renders triggered by
  // anything other than a refetch — e.g., when the wall clock crosses
  // close_time and the next render flips badges + pins but the count
  // would still reflect pre-crossing status. Filtering N truck rows per
  // render is trivial at MVP scale.
  const openCount = trucks.reduce((count, tr) => count + (deriveIsOpen(tr.schedule) ? 1 : 0), 0);

  const selectedSorted = useMemo(
    () => (selectedTruckId ? sortedTrucks.find((s) => s.truck.id === selectedTruckId) : undefined),
    [sortedTrucks, selectedTruckId],
  );

  const permissionDenied = permissionStatus === 'denied';
  const isLocating = permissionStatus === 'granted' && !coords;

  const handlePinPress = (id: string) => {
    const truck = trucks.find((tr) => tr.id === id);
    if (!truck?.schedule) return;
    // Capture pre-selection snap only on the FIRST pin tap (entering
    // selection mode). If the user taps a different pin while a summary
    // is already open, keep the original pre-selection value so close
    // restores to where they actually started.
    if (selectedTruckId === null) {
      preSelectionSnapRef.current = sheetIndexRef.current;
    }
    setSelectedTruckId(id);
    cameraRef.current?.setCamera({
      centerCoordinate: [truck.schedule.location_lng, truck.schedule.location_lat],
      zoomLevel: USER_ZOOM,
      animationDuration: CAMERA_FLY_MS,
      animationMode: 'flyTo',
    });
    // Snap to half: the rich TruckSummary (hero image + status +
    // info card + actions) doesn't fit cleanly in peek (24% screen).
    // Half (50%) leaves enough vertical room for the summary while
    // keeping the map visible above it. Pre-selection snap is
    // captured above so close X restores wherever the user started.
    if (sheetIndexRef.current !== SNAP_HALF) {
      sheetRef.current?.snapToIndex(SNAP_HALF);
    }
  };

  const handleCloseSelection = () => {
    setSelectedTruckId(null);
    // Zoom out at the current center so the user gets the wider city
    // context back without being yanked to a different location. No
    // re-center — they keep their bearings on where the dismissed
    // truck was.
    cameraRef.current?.setCamera({
      zoomLevel: DEFAULT_ZOOM,
      animationDuration: CAMERA_FLY_MS,
      animationMode: 'flyTo',
    });
    // Restore the pre-selection snap (captured on the first pin tap),
    // so closing returns the sheet to where the user was. Falls back
    // to half if nothing was captured (defensive — shouldn't fire).
    const targetSnap = preSelectionSnapRef.current ?? SNAP_HALF;
    preSelectionSnapRef.current = null;
    if (sheetIndexRef.current !== targetSnap) {
      sheetRef.current?.snapToIndex(targetSnap);
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

  // Sheet body switches between five states. Extracted so the JSX tree
  // doesn't grow a banned nested ternary chain.
  const renderSheetBody = (): ReactNode => {
    // Selected mode: a single focused card. Skips the list/loading/empty
    // branches because we have a known selection regardless of fetch
    // state — the card just renders from the selected row in
    // sortedTrucks. (If selection points at a truck that's no longer in
    // the dataset — e.g., deleted during a refetch — selectedSorted is
    // undefined and we fall through to the normal list rendering.)
    if (selectedSorted) {
      return (
        <TruckSummary
          truck={selectedSorted.truck}
          distanceKm={selectedSorted.distanceKm}
          onClose={handleCloseSelection}
          onViewDetails={() => handleCardPress(selectedSorted.truck.id)}
          onGetDirections={() => {
            if (!selectedSorted.truck.schedule) return;
            void openMapsDirections({
              lat: selectedSorted.truck.schedule.location_lat,
              lng: selectedSorted.truck.schedule.location_lng,
              label: selectedSorted.truck.name,
            });
          }}
        />
      );
    }
    // Wrap error + empty states in a scrollable so the
    // "Pull to refresh." copy actually works — RefreshControl needs a
    // scrollable parent to attach to.
    const refreshControl = (
      <RefreshControl
        refreshing={isRefetching}
        onRefresh={() => void refetch()}
        tintColor={WARM_CREAM}
      />
    );
    if (error) {
      return (
        <BottomSheetScrollView refreshControl={refreshControl}>
          <EmptyState
            icon="alert-triangle"
            title={t('routes.consumer.mapScreen.errorTitle')}
            message={t('routes.consumer.mapScreen.errorMessage')}
          />
        </BottomSheetScrollView>
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
        <BottomSheetScrollView refreshControl={refreshControl}>
          <EmptyState
            icon="calendar"
            title={t('routes.consumer.mapScreen.emptyTitle')}
            message={t('routes.consumer.mapScreen.emptyMessage')}
          />
        </BottomSheetScrollView>
      );
    }
    return (
      <BottomSheetFlatList
        data={sortedTrucks}
        keyExtractor={(item) => item.truck.id}
        refreshing={isRefetching}
        onRefresh={() => void refetch()}
        renderItem={({ item }) => (
          <TruckCard
            truck={item.truck}
            distanceKm={item.distanceKm}
            isSelected={false}
            onPress={() => handleCardPress(item.truck.id)}
          />
        )}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  // List-mode header: title + open count. In selected mode the
  // TruckSummary owns its own header (close button + truck name on
  // the hero image), so the sheet header is hidden.
  const renderSheetHeader = (): ReactNode => {
    if (selectedSorted) return null;
    return (
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>{t('routes.consumer.mapScreen.nearbyTrucks')}</Text>
        <Badge action="accent" size="sm">
          <BadgeText>{t('routes.consumer.mapScreen.openNowCount', { count: openCount })}</BadgeText>
        </Badge>
      </View>
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
          <TruckPin
            key={truck.id}
            truck={truck}
            isSelected={truck.id === selectedTruckId}
            onPress={handlePinPress}
          />
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
        {/* Non-interactive label — explicit pointerEvents="none" so it
            doesn't intercept map pans (the parent's box-none only
            passes through empty areas; children stay hit-testable by
            default). */}
        <View pointerEvents="none">
          <Text style={styles.wordmark}>{t('routes.consumer.mapScreen.wordmark')}</Text>
        </View>
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
        {renderSheetHeader()}
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
