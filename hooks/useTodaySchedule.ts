import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useId } from 'react';

import type { TruckSchedule } from '@/lib/types';
import { supabase } from '@/services/supabase';
import { fetchTodaySchedule } from '@/services/todaySchedule';

/**
 * Reads today's truck_schedules row for the operator's truck and
 * subscribes to realtime updates filtered to that truck's rows so
 * external edits (Schedule screen TT-8 later, or another device) reflect
 * within ~2s.
 *
 * Per-mount channel name via useId() — same fix as PR #41 on useTrucks.
 * Without it, mounting Today twice (or Fast Refresh re-running the
 * effect before removeChannel's async leave completes) returns a
 * cached, already-subscribed channel and `.on('postgres_changes', ...)`
 * throws because filters can't be added after subscribe.
 *
 * Disabled when `truckId` is undefined — the operator has no truck and
 * Today renders the "set up" empty state instead.
 */
export function useTodaySchedule(truckId: string | undefined) {
  const queryClient = useQueryClient();
  const channelKey = useId();

  useEffect(() => {
    if (!truckId) return;
    const channel = supabase
      .channel(`today-schedule-${channelKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'truck_schedules',
          filter: `truck_id=eq.${truckId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['today-schedule', truckId] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, truckId, channelKey]);

  return useQuery<TruckSchedule | null>({
    queryKey: ['today-schedule', truckId],
    queryFn: () => {
      if (!truckId) return Promise.resolve(null);
      return fetchTodaySchedule(truckId);
    },
    enabled: !!truckId,
  });
}
