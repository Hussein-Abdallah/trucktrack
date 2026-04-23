import { useQuery } from '@tanstack/react-query';

import type { Truck, TruckSchedule } from '@/lib/types';
import { supabase } from '@/services/supabase';

// yyyy-MM-dd in UTC — mirrors useTrucks (see hooks/useTrucks.ts:11).
// Supabase runs UTC so this matches `current_date`; Ottawa's local
// midnight boundary lands outside truck operating windows.
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface TruckProfileData {
  truck: Truck;
  todaySchedules: TruckSchedule[];
}

// Two separate queries rather than a !inner join: the profile screen
// must render a truck with no shifts today (unlike the map, which
// filters trucks without a schedule). `!inner` would 404 them.
async function fetchTruckProfile(id: string): Promise<TruckProfileData | null> {
  const today = todayIso();

  const { data: truck, error: truckErr } = await supabase
    .from('trucks')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();

  if (truckErr) throw truckErr;
  if (!truck) return null;

  const { data: schedules, error: schedErr } = await supabase
    .from('truck_schedules')
    .select('*')
    .eq('truck_id', id)
    .eq('date', today)
    .in('status', ['live', 'scheduled'])
    .order('open_time', { ascending: true });

  if (schedErr) throw schedErr;

  return { truck, todaySchedules: schedules ?? [] };
}

export function useTruckProfile(id: string | undefined) {
  return useQuery<TruckProfileData | null>({
    queryKey: ['truck', id, todayIso()],
    queryFn: () => {
      // `enabled` gates this, but guard anyway so TS narrows id to string
      // without a cast, and a misconfigured caller fails loud.
      if (!id) throw new Error('useTruckProfile: id is required');
      return fetchTruckProfile(id);
    },
    enabled: Boolean(id),
  });
}
