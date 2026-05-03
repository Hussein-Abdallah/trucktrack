import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { TruckSchedule, TruckScheduleStatus } from '@/lib/types';
import { setTodayStatus } from '@/services/todaySchedule';

interface ToggleVars {
  truckId: string;
  scheduleId: string;
  status: TruckScheduleStatus;
}

interface OptimisticContext {
  previous: TruckSchedule | null | undefined;
}

/**
 * Toggles today's schedule status (scheduled ↔ live) with optimistic
 * UI — the badge flip needs to feel instant during a service rush.
 *
 * onMutate: snapshot current cache, write the predicted next state.
 * onError: roll back from snapshot.
 * onSettled: invalidate so realtime / server truth wins on the next
 *   refetch (covers the case where the server rejected the toggle but
 *   we got a network error before reading the response body).
 *
 * First optimistic-mutation pattern in the codebase — keeping it
 * minimal and well-commented; future toggles (winter-pause,
 * cancel-today) should mirror this shape.
 */
export function useSetTodayStatus() {
  const queryClient = useQueryClient();
  return useMutation<TruckSchedule, Error, ToggleVars, OptimisticContext>({
    mutationFn: ({ scheduleId, status }) => setTodayStatus({ scheduleId, status }),
    onMutate: async ({ truckId, status }) => {
      // Cancel in-flight refetches so they don't overwrite our
      // optimistic write before the mutation settles.
      await queryClient.cancelQueries({ queryKey: ['today-schedule', truckId] });
      const previous = queryClient.getQueryData<TruckSchedule | null>(['today-schedule', truckId]);
      queryClient.setQueryData<TruckSchedule | null>(['today-schedule', truckId], (prev) =>
        prev ? { ...prev, status } : prev,
      );
      return { previous };
    },
    onError: (_err, { truckId }, context) => {
      if (context !== undefined) {
        queryClient.setQueryData<TruckSchedule | null>(
          ['today-schedule', truckId],
          context.previous ?? null,
        );
      }
    },
    onSettled: (_data, _err, { truckId }) => {
      void queryClient.invalidateQueries({ queryKey: ['today-schedule', truckId] });
    },
  });
}
