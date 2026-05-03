import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { SavedLocation, TruckSchedule } from '@/lib/types';
import { publishTodaySchedule } from '@/services/todaySchedule';

interface PublishVars {
  truckId: string;
  savedLocation: SavedLocation;
}

/**
 * Wraps publishTodaySchedule (find-or-create on today's row) in a
 * mutation. On success we seed the resolved row directly into
 * ['today-schedule', truckId] AND invalidate, so the UI updates
 * instantly without waiting for the realtime echo. The realtime
 * subscription in useTodaySchedule will fire shortly after as a second
 * source of truth — invalidate makes that a no-op refetch instead of a
 * conflicting write.
 */
export function usePublishTodaySchedule() {
  const queryClient = useQueryClient();
  return useMutation<TruckSchedule, Error, PublishVars>({
    mutationFn: ({ truckId, savedLocation }) => publishTodaySchedule({ truckId, savedLocation }),
    onSuccess: (row, { truckId }) => {
      queryClient.setQueryData<TruckSchedule | null>(['today-schedule', truckId], row);
      void queryClient.invalidateQueries({ queryKey: ['today-schedule', truckId] });
    },
  });
}
