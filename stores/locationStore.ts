import * as Location from 'expo-location';
import { create } from 'zustand';

import type { Coord } from '@/lib/types';

export type LocationPermissionStatus = 'undetermined' | 'granted' | 'denied';

interface LocationState {
  permissionStatus: LocationPermissionStatus;
  coords: Coord | null;
  // Active position-watch handle. Kept on the store so refresh + teardown
  // can cancel it without leaking the GPS subscription across remounts.
  // Underscore-prefixed = internal; not part of the consumed shape.
  _subscription: Location.LocationSubscription | null;
  // Monotonic counter bumped on every refresh start AND every teardown.
  // Captured at the start of refresh() and re-checked after the
  // watchPositionAsync await — if it changed, the awaited subscription
  // is stale (a newer refresh ran or teardown happened mid-flight) and
  // we drop it instead of attaching it. Without this, the slow GPS-lock
  // await window can re-attach a watch after the screen unmounted,
  // leaking polling and battery.
  _watchEpoch: number;
  /** Asks the OS for permission (no-op prompt if already determined),
   *  syncs permissionStatus, and starts the watch when granted. */
  requestPermission: () => Promise<void>;
  /** Restarts the position watch. Safe to call from app-resume to
   *  re-sync after the user toggled the permission in Settings. */
  refresh: () => Promise<void>;
  /** Cancels the watch and clears coords. Call on screen unmount. */
  teardown: () => void;
}

function toStatus(raw: Location.PermissionStatus): LocationPermissionStatus {
  if (raw === 'granted') return 'granted';
  if (raw === 'denied') return 'denied';
  return 'undetermined';
}

export const useLocationStore = create<LocationState>((set, get) => ({
  permissionStatus: 'undetermined',
  coords: null,
  _subscription: null,
  _watchEpoch: 0,

  requestPermission: async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const permissionStatus = toStatus(status);
    set({ permissionStatus });
    if (permissionStatus === 'granted') {
      await get().refresh();
    } else {
      // Permission revoked or denied — teardown stops the watch and
      // clears coords in one shot.
      get().teardown();
    }
  },

  refresh: async () => {
    if (get().permissionStatus !== 'granted') return;

    // Cancel any prior watch before starting a new one (repeated refresh
    // calls or app-resume races otherwise leak subscriptions). Bump the
    // epoch so any in-flight earlier refresh() drops its result instead
    // of overwriting ours.
    get()._subscription?.remove();
    const epoch = get()._watchEpoch + 1;
    set({ _subscription: null, _watchEpoch: epoch });

    try {
      const sub = await Location.watchPositionAsync(
        {
          // Battery-conscious watch: ~50m of movement OR 30s elapsed
          // wakes the callback. The map pin doesn't need sub-meter
          // accuracy and aggressive polling drains the battery fast.
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 50,
          timeInterval: 30_000,
        },
        (loc) => {
          // Late-callback guard: Expo's watchPositionAsync can deliver
          // a callback AFTER subscription.remove() due to platform
          // timing on iOS/Android. Without this check, a stale watch
          // can repopulate coords seconds after teardown — defeating
          // the unmount cleanup.
          if (get()._watchEpoch !== epoch || get().permissionStatus !== 'granted') return;
          set({ coords: { lat: loc.coords.latitude, lng: loc.coords.longitude } });
        },
      );
      // Stale-completion guard: if teardown or a newer refresh ran
      // while watchPositionAsync was awaiting (GPS lock can take
      // seconds), the epoch will have moved on. Drop the subscription
      // instead of re-attaching it, otherwise we leak a watch that no
      // caller is tracking and battery polls forever.
      if (get()._watchEpoch !== epoch || get().permissionStatus !== 'granted') {
        sub.remove();
        return;
      }
      set({ _subscription: sub });
    } catch (err) {
      // Same stale-guard for the failure path: if teardown happened
      // during the await, we shouldn't clobber its cleared state.
      if (get()._watchEpoch !== epoch) return;
      // Simulator without GPS, or a transient OS error. Render no dot;
      // the locate button stays visible but does nothing on tap until
      // a refresh succeeds. Clear coords so callers don't render the
      // last-known position when the watch is no longer active. Surface
      // the error for dev triage.
      set({ _subscription: null, coords: null });
      // eslint-disable-next-line no-console
      console.warn('[locationStore] watchPositionAsync failed:', err);
    }
  },

  teardown: () => {
    get()._subscription?.remove();
    // Bump the epoch so any in-flight refresh() drops its result on
    // resume. Clear coords alongside the subscription so a later
    // remount starts from a clean slate — matches the documented
    // contract on the teardown property above.
    set((state) => ({
      _subscription: null,
      coords: null,
      _watchEpoch: state._watchEpoch + 1,
    }));
  },
}));
