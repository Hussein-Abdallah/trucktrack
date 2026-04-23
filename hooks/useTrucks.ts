import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import type { Truck, TruckSchedule, TruckWithSchedule } from '@/lib/types';
import { supabase } from '@/services/supabase';

// yyyy-MM-dd in UTC — matches Postgres `current_date` on Supabase
// (which runs UTC). Multi-timezone is a separate concern; for Ottawa
// the midnight-UTC boundary lands at 7/8 pm local, well outside truck
// operating windows.
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

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

async function fetchTrucks(): Promise<TruckWithSchedule[]> {
  const today = todayIso();
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
      .channel('trucks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'truck_schedules' }, () => {
        void queryClient.invalidateQueries({ queryKey: ['trucks'] });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Including today in the key forces a fresh fetch when the date rolls
  // over — without it, an app left mounted past midnight would keep
  // serving yesterday's schedules from cache until staleTime expires.
  return useQuery<TruckWithSchedule[]>({
    queryKey: ['trucks', todayIso()],
    queryFn: fetchTrucks,
  });
}
