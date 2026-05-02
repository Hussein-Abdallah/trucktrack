import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useId } from 'react';

import { pickSchedule, todayIso } from '@/lib/schedule';
import type { Truck, TruckSchedule, TruckWithSchedule } from '@/lib/types';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';

// Pivot from `follows` so RLS auto-filters to the caller's rows (defense
// in depth — the explicit consumer_id eq is what PostgREST pushes down
// for an indexed lookup). Inner-join trucks (we don't surface follows
// pointing at deleted/inactive trucks). Left-join today's truck_schedules
// so a followed truck without a shift today still appears with
// `schedule: null` (rendered as "no shifts today"). The schedule filter
// goes on the embedded resource, not the parent — PostgREST supports
// that via `.eq('trucks.truck_schedules.date', ...)`.
type FollowRow = {
  truck_id: string;
  trucks: Truck & { truck_schedules: TruckSchedule[] };
};

async function fetchFollowedTrucks(userId: string, today: string): Promise<TruckWithSchedule[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('truck_id, trucks!inner(*, truck_schedules(*))')
    .eq('consumer_id', userId)
    .eq('trucks.is_active', true)
    .eq('trucks.truck_schedules.date', today)
    .in('trucks.truck_schedules.status', ['live', 'scheduled'])
    .returns<FollowRow[]>();

  if (error) throw error;

  return (data ?? []).map((row) => {
    const { truck_schedules: schedules, ...truck } = row.trucks;
    // The embed filter already constrains rows to today + live/scheduled,
    // but pickSchedule still resolves the case where a truck has multiple
    // overlapping schedules today (live wins; otherwise earliest open).
    return { ...truck, schedule: pickSchedule(schedules) };
  });
}

/**
 * Loads the trucks the current consumer follows + today's schedule
 * (where one exists). Mirrors useTrucks's shape so the same TruckCard /
 * sort / distance helpers apply.
 *
 * Realtime: subscribes to `truck_schedules` (already in the realtime
 * publication per migration 20260423041844_realtime_truck_schedules.sql)
 * so an operator publishing/cancelling/moving an in-app truck flips the
 * follow-feed card within ~2s without a manual refresh.
 *
 * Follow-table changes (a new follow added from the truck profile, an
 * existing one removed) are NOT covered here — that would need a
 * separate migration to add `follows` to the publication. Callers
 * should pair this hook with `useFocusEffect(refetch)` on the screen
 * so returning to the tab after a follow toggle picks up the change.
 *
 * Per-mount channel name via useId() so re-mount churn (Fast Refresh,
 * tab switching) can't collide with a still-subscribed channel — same
 * fix as PR #41 on useTrucks.
 */
export function useFollowedTrucks() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.session?.userId);
  const channelKey = useId();

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`followed-trucks-${channelKey}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'truck_schedules' }, () => {
        void queryClient.invalidateQueries({ queryKey: ['followed-trucks', userId] });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, userId, channelKey]);

  // Capture today once so the queryKey and the date filter inside the
  // fetcher can't straddle midnight UTC. Same pattern as useTrucks.
  const today = todayIso();
  return useQuery<TruckWithSchedule[]>({
    queryKey: ['followed-trucks', userId, today],
    queryFn: () => {
      // Guard runtime — `enabled` below prevents the call when userId
      // is undefined, but TypeScript still wants the narrowing here.
      if (!userId) return Promise.resolve([]);
      return fetchFollowedTrucks(userId, today);
    },
    enabled: !!userId,
  });
}
