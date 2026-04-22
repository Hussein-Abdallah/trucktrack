import { useQuery } from '@tanstack/react-query';

import type { Truck, TruckSchedule, TruckWithSchedule } from '@/lib/types';
import { supabase } from '@/services/supabase';

// yyyy-MM-dd in UTC — matches Postgres `current_date` on Supabase
// (which runs UTC). Multi-timezone is a separate concern; for Ottawa
// the midnight-UTC boundary lands at 7/8 pm local, well outside truck
// operating windows.
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// Convert HH:MM:SS to seconds since midnight so open/close windows are
// directly comparable with the wall clock with one cheap subtraction.
function timeStrToSeconds(t: string): number {
  const [h, m, s] = t.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

function nowSecondsLocal(): number {
  const d = new Date();
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
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

function deriveIsOpen(schedule: TruckSchedule): boolean {
  if (schedule.status !== 'live') return false;
  const now = nowSecondsLocal();
  return now >= timeStrToSeconds(schedule.open_time) && now < timeStrToSeconds(schedule.close_time);
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
    const schedule = pickSchedule(schedules);
    return {
      ...truck,
      schedule,
      isOpen: schedule ? deriveIsOpen(schedule) : false,
    };
  });
}

export function useTrucks() {
  return useQuery<TruckWithSchedule[]>({
    queryKey: ['trucks'],
    queryFn: fetchTrucks,
  });
}
