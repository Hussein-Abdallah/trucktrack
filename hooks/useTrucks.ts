import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useId } from 'react';

import { todayIso } from '@/lib/schedule';
import type { Truck, TruckSchedule, TruckWithSchedule } from '@/lib/types';
import { supabase } from '@/services/supabase';

// Multiple schedule rows for one truck on the same day shouldn't happen
// in normal use, but recurring schedules can overlap. Per TT-35 AC: pick
// the live row first, otherwise the earliest open_time.
function pickSchedule(rows: TruckSchedule[]): TruckSchedule | null {
  if (rows.length === 0) return null;
  const live = rows.find((r) => r.status === 'live');
  if (live) return live;
  return [...rows].sort((a, b) => a.open_time.localeCompare(b.open_time))[0];
}

// The `!inner` embedded select returns truck rows with their matching
// schedules array attached. Database types in lib/types.ts don't model
// the relation (Relationships: []), so we assert the response shape via
// .returns<>() rather than fight the inferred type.
type TruckWithSchedulesRow = Truck & { truck_schedules: TruckSchedule[] };

async function fetchTrucks(today: string): Promise<TruckWithSchedule[]> {
  const { data, error } = await supabase
    .from('trucks')
    .select('*, truck_schedules!inner(*)')
    .eq('is_active', true)
    .eq('truck_schedules.date', today)
    .in('truck_schedules.status', ['live', 'scheduled'])
    .returns<TruckWithSchedulesRow[]>();

  if (error) throw error;

  return (data ?? []).map((row) => {
    const { truck_schedules: schedules, ...truck } = row;
    return { ...truck, schedule: pickSchedule(schedules) };
  });
}

export function useTrucks() {
  const queryClient = useQueryClient();
  // Per-instance channel name. supabase.channel() caches by name on the
  // Realtime client; if useTrucks mounts in two screens, or fast-refresh
  // re-runs the effect before removeChannel's async leave completes,
  // the second mount gets the already-subscribed channel back and
  // .on('postgres_changes', ...) throws because filters can't be added
  // after subscribe. A per-mount unique id sidesteps the cache.
  const channelKey = useId();

  // Subscribe to Postgres changes on truck_schedules so the map updates
  // within ~2s of an operator publishing/moving/cancelling — closes the
  // gap that pull-to-refresh and the 30s staleTime leave open. The
  // migration in 20260423041844_realtime_truck_schedules.sql is what
  // makes the table emit events; without it this subscription is silent.
  //
  // Invalidate with prefix ['trucks'] (not the full date-suffixed key)
  // so the match still works the moment the date rolls over and the key
  // changes underneath us.
  useEffect(() => {
    const channel = supabase
      .channel(`trucks-realtime-${channelKey}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'truck_schedules' }, () => {
        void queryClient.invalidateQueries({ queryKey: ['trucks'] });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, channelKey]);

  // Including today in the key forces a fresh fetch when the date rolls
  // over — without it, an app left mounted past midnight would keep
  // serving yesterday's schedules from cache until staleTime expires.
  // Capture once so the key and the filter can't straddle midnight UTC.
  const today = todayIso();
  return useQuery<TruckWithSchedule[]>({
    queryKey: ['trucks', today],
    queryFn: () => fetchTrucks(today),
  });
}
