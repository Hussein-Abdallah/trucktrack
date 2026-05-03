import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { SavedLocation, Truck } from '@/lib/types';
import {
  createOperatorTruck,
  DuplicateTruckError,
  fetchOperatorTruck,
  type CreateOperatorTruckArgs,
} from '@/services/operatorTruck';
import { addSavedLocation, type AddSavedLocationArgs } from '@/services/savedLocations';

interface CreateOperatorTruckVars extends CreateOperatorTruckArgs {
  /** Optional first saved location to insert atomically-ish after the
   *  truck row lands. Skipped if undefined (operator skipped step 5). */
  firstLocation?: Omit<AddSavedLocationArgs, 'operatorId'>;
}

interface CreateOperatorTruckResult {
  truck: Truck;
  savedLocation: SavedLocation | null;
  /** True when the saved-location insert failed after the truck
   *  insert succeeded. Onboarding still completes; the operator can
   *  add the location later from the Today screen. The flag lets the
   *  caller surface a soft "couldn't save your spot" toast. */
  savedLocationFailed: boolean;
}

/**
 * End-of-onboarding mutation (TT-9 step 6). Creates the operator's
 * truck row and, if the wizard collected one, their first saved
 * location. The two writes are NOT in a single transaction — Supabase
 * doesn't expose multi-statement transactions to PostgREST clients —
 * so the failure modes are handled defensively:
 *
 * - Truck insert fails: rejects with the truck error; UI retries with
 *   the same form state.
 * - Truck insert hits the `trucks_operator_id_unique` constraint
 *   (PG 23505): a previous attempt or a parallel device already
 *   created the row. Fall back to `fetchOperatorTruck`, treat that as
 *   the winning row, and continue. This converges both retry-after-
 *   transient-error and the dual-device race onto the same end state.
 * - Truck insert succeeds, saved-location fails: swallow the saved-
 *   location error (it's an optional field anyway), set
 *   `savedLocationFailed=true` so the caller can toast a soft warning,
 *   and let onboarding complete. Without this, an operator whose
 *   network blips during the second write would be permanently wedged
 *   on retry: the second create would 23505 and there's no recovery.
 *
 * onSuccess seeds the cache so Today's `useOperatorTruck` query
 * resolves immediately after navigation, without an extra refetch.
 */
export function useCreateOperatorTruck() {
  const queryClient = useQueryClient();

  return useMutation<CreateOperatorTruckResult, Error, CreateOperatorTruckVars>({
    mutationFn: async ({ firstLocation, ...truckArgs }) => {
      let truck: Truck;
      try {
        truck = await createOperatorTruck(truckArgs);
      } catch (err) {
        // services/operatorTruck.ts:mapError surfaces Postgres
        // 23505 (unique_violation on trucks_operator_id_unique) as
        // DuplicateTruckError. instanceof beats string-matching on
        // the message — the constraint name could change without
        // warning the client.
        if (!(err instanceof DuplicateTruckError)) throw err;

        // Lost the race (or this is a retry after a partial success).
        // Fetch the winning row and continue — the truck the operator
        // sees on Today is the same one in the DB.
        const existing = await fetchOperatorTruck(truckArgs.operatorId);
        if (!existing) throw err; // shouldn't happen; rethrow original
        truck = existing;
      }

      let savedLocation: SavedLocation | null = null;
      let savedLocationFailed = false;
      if (firstLocation) {
        try {
          savedLocation = await addSavedLocation({
            operatorId: truckArgs.operatorId,
            ...firstLocation,
          });
        } catch (err) {
          // Saved location is optional — never block onboarding on it.
          // Caller will surface a soft "add your spot from the Today
          // screen" toast based on `savedLocationFailed`.
          // eslint-disable-next-line no-console
          console.warn('[onboarding] addSavedLocation failed; skipping:', err);
          savedLocationFailed = true;
        }
      }

      return { truck, savedLocation, savedLocationFailed };
    },
    onSuccess: ({ truck, savedLocation }, variables) => {
      // Seed the operator-truck cache so Today's useOperatorTruck
      // query resolves to this row instantly post-navigation.
      queryClient.setQueryData<Truck | null>(['operator-truck', variables.operatorId], truck);

      // Saved-location query keys off operatorId; invalidate so the
      // chip grid picks up the new row on next focus. setQueryData
      // would require knowing the array shape served by
      // fetchSavedLocations (ordered by display_order then created_at)
      // — invalidate is simpler and correct.
      if (savedLocation) {
        void queryClient.invalidateQueries({
          queryKey: ['saved-locations', variables.operatorId],
        });
      }
    },
  });
}
