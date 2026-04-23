import type { TruckSchedule } from '@/lib/types';

// Convert HH:MM:SS to seconds since midnight so open/close windows are
// directly comparable with the wall clock with one cheap subtraction.
export function timeStrToSeconds(t: string): number {
  const [h, m, s] = t.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

export function nowSecondsLocal(): number {
  const d = new Date();
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
}

// Compares device-local clock seconds against schedule.open_time /
// close_time as if both are in the same timezone. Per CLAUDE.md the
// MVP is Ottawa-first, so device-local ≈ Ottawa-local ≈ what operators
// entered when seeding their schedules — the comparison is correct in
// practice. When the app expands beyond Ottawa, schedules will need a
// timezone column (or canonical UTC storage) and this helper will need
// to project both sides into the same zone before comparing.
// TODO(multi-city): timezone-aware open/close comparison.
//
// Called at render time (not fetch time) so the open→closed transition
// happens on the next re-render after close_time passes — TT-40 realtime
// invalidation, pull-to-refresh, screen focus, or any state change all
// trigger one. Without this, the cached value stays stale until a
// refetch. Accepts null to collapse the "no schedule today" call site
// to a single line in every consumer.
export function deriveIsOpen(schedule: TruckSchedule | null): boolean {
  if (!schedule) return false;
  if (schedule.status !== 'live') return false;
  const now = nowSecondsLocal();
  return now >= timeStrToSeconds(schedule.open_time) && now < timeStrToSeconds(schedule.close_time);
}
