import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddSavedLocationModal } from '@/components/operator/AddSavedLocationModal';
import { SavedLocationChip } from '@/components/operator/SavedLocationChip';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';
import { useOperatorTruck } from '@/hooks/useOperatorTruck';
import { usePublishTodaySchedule } from '@/hooks/usePublishTodaySchedule';
import { useSavedLocations } from '@/hooks/useSavedLocations';
import { useSetTodayStatus } from '@/hooks/useSetTodayStatus';
import { useTodaySchedule } from '@/hooks/useTodaySchedule';
import type { SavedLocation } from '@/lib/types';
import { useAuthStore } from '@/stores/authStore';
import {
  ALERT_RED,
  APP_BLACK,
  CHARCOAL,
  CTA_WHITE,
  FIRE_ORANGE,
  GRAPHITE,
  MID,
  MUTED,
  WARM_CREAM,
} from '@/theme/colors';

export default function TodayScreen() {
  const { t } = useTranslation();
  const userId = useAuthStore((state) => state.session?.userId);

  const truckQuery = useOperatorTruck();
  const truck = truckQuery.data;
  const truckId = truck?.id;

  const scheduleQuery = useTodaySchedule(truckId);
  const locationsQuery = useSavedLocations();
  const publishMutation = usePublishTodaySchedule();
  const toggleMutation = useSetTodayStatus();

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  // Tracks user-initiated pull-to-refresh ONLY. Wiring RefreshControl
  // directly to *Query.isRefetching would also flash the spinner on
  // every background invalidate — and toggling OPEN/CLOSED triggers
  // two invalidates in quick succession (mutation onSettled + realtime
  // echo of the row we just wrote), producing a double layout-shift
  // that reads as a bug.
  const [isPulling, setIsPulling] = useState(false);

  // Auto-close the AddSavedLocation modal if the session disappears
  // while it's open (token refresh failure, sign-out from another tab).
  // Submitting without a userId would round-trip through RLS and fail
  // with an opaque error; the operator will be redirected to login by
  // the parent layout's session guard moments later.
  useEffect(() => {
    if (!userId && modalOpen) setModalOpen(false);
  }, [userId, modalOpen]);

  // Refetch on tab return — covers external Schedule-screen edits
  // (TT-8 future) and add/remove from another tab. Realtime covers
  // mid-session schedule updates already. Capture the stable refetch
  // refs so the effect doesn't re-run on every render (query objects
  // change identity each render; their refetch fn does not).
  const { refetch: refetchSchedule } = scheduleQuery;
  const { refetch: refetchLocations } = locationsQuery;
  useFocusEffect(
    useCallback(() => {
      void refetchSchedule();
      void refetchLocations();
    }, [refetchSchedule, refetchLocations]),
  );

  const todaySchedule = scheduleQuery.data ?? null;
  // Operator UX: "I am actively serving right now" — explicit toggle
  // state, not a wall-clock derive. deriveIsOpen is for consumer-side
  // "is it open right now per the schedule".
  const isOpen = todaySchedule?.status === 'live';

  const onRefresh = async () => {
    setIsPulling(true);
    try {
      await Promise.all([truckQuery.refetch(), scheduleQuery.refetch(), locationsQuery.refetch()]);
    } finally {
      setIsPulling(false);
    }
  };

  const handlePublish = () => {
    if (!truckId || !selectedLocationId) return;
    const location = locationsQuery.data?.find((l) => l.id === selectedLocationId);
    if (!location) return;
    setActionError(null);
    publishMutation.mutate(
      { truckId, savedLocation: location },
      {
        onError: () => setActionError(t('routes.operator.todayScreen.errors.publishFailed')),
      },
    );
  };

  const handleToggle = () => {
    if (!truckId || !todaySchedule) return;
    setActionError(null);
    toggleMutation.mutate(
      {
        truckId,
        scheduleId: todaySchedule.id,
        status: isOpen ? 'scheduled' : 'live',
      },
      {
        onError: () => setActionError(t('routes.operator.todayScreen.errors.toggleFailed')),
      },
    );
  };

  if (truckQuery.isLoading || !userId) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.loading}>
          <ActivityIndicator color={FIRE_ORANGE} />
        </View>
      </SafeAreaView>
    );
  }

  // Distinguish "no truck row" (operator hasn't onboarded yet) from
  // "truck fetch failed" (transient network or RLS hiccup). The former
  // routes into onboarding; the latter offers retry. Without this
  // branch, a flaky network on app launch silently sends the operator
  // back to onboarding, which is wrong and confusing.
  if (truckQuery.isError) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <Header title={t('routes.operator.todayScreen.header')} />
        <EmptyState
          icon="alert-triangle"
          title={t('routes.operator.todayScreen.loadErrorTitle')}
          message={t('routes.operator.todayScreen.loadErrorMessage')}
          actionLabel={t('truck.profile.error.retry')}
          onAction={() => void truckQuery.refetch()}
        />
      </SafeAreaView>
    );
  }

  if (!truck) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <Header title={t('routes.operator.todayScreen.header')} />
        <EmptyState
          icon="truck"
          title={t('routes.operator.todayScreen.noTruckTitle')}
          message={t('routes.operator.todayScreen.noTruckMessage')}
          actionLabel={t('routes.operator.todayScreen.finishSetup')}
          onAction={() => router.push('/onboarding/operator')}
        />
      </SafeAreaView>
    );
  }

  // Schedule + locations queries have their own loading/error states.
  // Without these branches, an in-flight or failed fetch falls through
  // to "no location published" / "no saved locations" empty UI — wrong
  // signal to the operator. CLAUDE.md: every screen must handle
  // loading, error, and empty states explicitly.
  if (scheduleQuery.isLoading || locationsQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <Header title={t('routes.operator.todayScreen.header')} />
        <View style={styles.loading}>
          <ActivityIndicator color={FIRE_ORANGE} />
        </View>
      </SafeAreaView>
    );
  }

  if (scheduleQuery.isError || locationsQuery.isError) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <Header title={t('routes.operator.todayScreen.header')} />
        <EmptyState
          icon="alert-triangle"
          title={t('routes.operator.todayScreen.loadErrorTitle')}
          message={t('routes.operator.todayScreen.loadErrorMessage')}
          actionLabel={t('truck.profile.error.retry')}
          onAction={() => {
            void scheduleQuery.refetch();
            void locationsQuery.refetch();
          }}
        />
      </SafeAreaView>
    );
  }

  const locations = locationsQuery.data ?? [];
  const hasLocations = locations.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Header title={t('routes.operator.todayScreen.header')} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isPulling}
            onRefresh={() => void onRefresh()}
            tintColor={WARM_CREAM}
          />
        }
      >
        {/* Status section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionLabel}>{t('routes.operator.todayScreen.statusLabel')}</Text>
            <Badge action={isOpen ? 'open' : 'closed'} size="md">
              <BadgeText>
                {t(
                  isOpen
                    ? 'routes.operator.todayScreen.open'
                    : 'routes.operator.todayScreen.closed',
                )}
              </BadgeText>
            </Badge>
          </View>
          <Pressable
            onPress={handleToggle}
            disabled={!todaySchedule || toggleMutation.isPending}
            accessibilityRole="button"
            accessibilityState={{ disabled: !todaySchedule, selected: isOpen }}
            accessibilityLabel={t(
              isOpen
                ? 'routes.operator.todayScreen.closeForBusiness'
                : 'routes.operator.todayScreen.openForBusiness',
            )}
            style={[styles.toggle, !todaySchedule && styles.toggleDisabled]}
          >
            <Feather name="power" size={18} color={CTA_WHITE} />
            <Text style={styles.toggleText}>
              {/* Label is the action tapping performs, not the current
                  state — the badge above already carries the status
                  signal. Button stays neutral in both states so color
                  and label pull in the same direction. */}
              {t(
                isOpen
                  ? 'routes.operator.todayScreen.closeForBusiness'
                  : 'routes.operator.todayScreen.openForBusiness',
              )}
            </Text>
          </Pressable>
        </View>

        {/* Current location */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('routes.operator.todayScreen.currentLocationLabel')}
          </Text>
          <View style={styles.currentLocation}>
            {todaySchedule ? (
              <View style={styles.currentLocationRow}>
                <Feather name="map-pin" size={18} color={FIRE_ORANGE} />
                <Text style={styles.currentLocationText}>{todaySchedule.location_label}</Text>
              </View>
            ) : (
              <Text style={styles.muted}>
                {t('routes.operator.todayScreen.noLocationPublished')}
              </Text>
            )}
          </View>
        </View>

        {/* Publish CTA — primary orange. Feather pin icon inline as a
            sibling of ButtonText (rather than via Gluestack ButtonIcon)
            because the rest of the screen uses @expo/vector-icons; Button
            base class has gap-2 so the layout works without overrides. */}
        <Button
          action="primary"
          size="lg"
          onPress={handlePublish}
          isDisabled={!selectedLocationId || publishMutation.isPending}
        >
          <Feather name="map-pin" size={18} color={CTA_WHITE} />
          <ButtonText>{t('routes.operator.todayScreen.publishLocation')}</ButtonText>
        </Button>

        {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

        {/* Saved locations grid */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('routes.operator.todayScreen.savedLocationsLabel')}
          </Text>
          {hasLocations ? (
            <View style={styles.grid}>
              {locations.map((loc: SavedLocation) => (
                <View key={loc.id} style={styles.gridCell}>
                  <SavedLocationChip
                    location={loc}
                    isActive={selectedLocationId === loc.id}
                    onPress={() => setSelectedLocationId(loc.id)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyLocations}>
              <EmptyState
                icon="map-pin"
                title={t('routes.operator.todayScreen.noLocationsTitle')}
                message={t('routes.operator.todayScreen.noLocationsMessage')}
              />
            </View>
          )}

          <View style={styles.addButton}>
            <Button action="secondary" size="lg" onPress={() => setModalOpen(true)}>
              <ButtonText>{t('routes.operator.todayScreen.addLocation')}</ButtonText>
            </Button>
          </View>
        </View>
      </ScrollView>

      <AddSavedLocationModal
        visible={modalOpen}
        operatorId={userId}
        onClose={() => setModalOpen(false)}
      />
    </SafeAreaView>
  );
}

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_BLACK },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: 'BebasNeue',
    fontSize: 28,
    letterSpacing: 2,
    color: WARM_CREAM,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 24,
  },
  card: {
    backgroundColor: CHARCOAL,
    borderColor: MID,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontFamily: 'DMMono',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: MUTED,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 14,
    backgroundColor: GRAPHITE,
    borderColor: MID,
    borderWidth: 1,
  },
  toggleDisabled: {
    opacity: 0.5,
  },
  toggleText: {
    fontFamily: 'DMMono',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: CTA_WHITE,
  },
  section: { gap: 8 },
  currentLocation: {
    backgroundColor: CHARCOAL,
    borderColor: MID,
    borderWidth: 1,
    padding: 16,
  },
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentLocationText: {
    flex: 1,
    color: WARM_CREAM,
    fontFamily: 'DMSans',
    fontSize: 14,
  },
  muted: { color: MUTED, fontFamily: 'DMSans', fontSize: 14 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridCell: {
    width: '50%',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  emptyLocations: {
    paddingVertical: 8,
  },
  addButton: {
    marginTop: 12,
  },
  error: {
    color: ALERT_RED,
    fontFamily: 'DMSans',
    fontSize: 13,
  },
});
