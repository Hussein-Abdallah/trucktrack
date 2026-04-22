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
    // calls or app-resume races otherwise leak subscriptions).
    get()._subscription?.remove();
    set({ _subscription: null });

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
          set({ coords: { lat: loc.coords.latitude, lng: loc.coords.longitude } });
        },
      );
      set({ _subscription: sub });
    } catch (err) {
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
    // Clear coords alongside the subscription so a later remount starts
    // from a clean slate — matches the documented contract on the
    // teardown property above.
    set({ _subscription: null, coords: null });
  },
}));
