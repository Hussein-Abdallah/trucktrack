import { AppError, NetworkError, isNetworkError, type PostgrestLikeError } from '@/lib/errors';
import { pickSchedule, todayIso } from '@/lib/schedule';
import type { SavedLocation, TruckSchedule, TruckScheduleStatus } from '@/lib/types';
import { supabase } from '@/services/supabase';

export abstract class ScheduleError extends AppError {}
export class ScheduleNotFoundError extends ScheduleError {}
export class UnknownScheduleError extends ScheduleError {}

export { NetworkError };

function mapError(err: PostgrestLikeError): AppError {
  if (isNetworkError(err)) return new NetworkError(err.message);
  if (err.code === 'PGRST116') return new ScheduleNotFoundError(err.message);
  return new UnknownScheduleError(err.message);
}

/**
 * Reads today's `truck_schedules` row(s) for the operator's truck and
 * folds them through pickSchedule (live first, otherwise earliest open).
 * Returns null when the truck has no schedule for today.
 *
 * The (truck_id, date) index on truck_schedules makes this an O(1)
 * lookup. status is left unconstrained server-side so a 'cancelled' row
 * doesn't masquerade as a published one downstream — pickSchedule will
 * skip it because it only matches 'live' explicitly and falls back to
 * the earliest open_time across the rows it sees, which can include a
 * 'scheduled' row that the operator un-cancelled later.
 */
export async function fetchTodaySchedule(truckId: string): Promise<TruckSchedule | null> {
  const { data, error } = await supabase
    .from('truck_schedules')
    .select('*')
    .eq('truck_id', truckId)
    .eq('date', todayIso());

  if (error) throw mapError(error);
  return pickSchedule(data ?? []);
}

export interface PublishTodayScheduleArgs {
  truckId: string;
  savedLocation: SavedLocation;
}

/**
 * Find-or-create on today's truck_schedules row for the operator's
 * truck. Done as SELECT-then-UPDATE-or-INSERT (not upsert) because the
 * (truck_id, date) index is non-unique — a plain upsert can't safely
 * collapse multiple historical rows for the same day, and the table
 * intentionally allows multiple rows (recurring + one-off overlap).
 *
 * Looks for an existing row in 'live' or 'scheduled' status (a
 * 'cancelled' row should not be silently revived — operator must
 * publish a fresh one). On hit: UPDATE the location/hours but preserve
 * the existing status, so re-publishing while currently OPEN doesn't
 * downgrade the truck to scheduled mid-service. On miss: INSERT with
 * status='scheduled'.
 */
export async function publishTodaySchedule(args: PublishTodayScheduleArgs): Promise<TruckSchedule> {
  const { truckId, savedLocation } = args;
  const today = todayIso();

  const existing = await supabase
    .from('truck_schedules')
    .select('*')
    .eq('truck_id', truckId)
    .eq('date', today)
    .in('status', ['live', 'scheduled']);

  if (existing.error) throw mapError(existing.error);

  const rows = existing.data ?? [];
  // pickSchedule resolves "which live/scheduled row counts as today's"
  // when more than one matches — keeps the find-or-create deterministic
  // even with a misconfigured recurring schedule overlapping today.
  const current = pickSchedule(rows);

  const locationFields = {
    location_lat: savedLocation.location_lat,
    location_lng: savedLocation.location_lng,
    location_label: savedLocation.location_label,
    open_time: savedLocation.default_open_time,
    close_time: savedLocation.default_close_time,
  };

  if (current) {
    const { data, error } = await supabase
      .from('truck_schedules')
      .update(locationFields)
      .eq('id', current.id)
      .select('*')
      .single();
    if (error) throw mapError(error);
    return data;
  }

  const { data, error } = await supabase
    .from('truck_schedules')
    .insert({
      truck_id: truckId,
      date: today,
      ...locationFields,
      status: 'scheduled',
    })
    .select('*')
    .single();
  if (error) throw mapError(error);
  return data;
}

export interface SetTodayStatusArgs {
  scheduleId: string;
  status: TruckScheduleStatus;
}

/**
 * Flips an existing schedule row's status — used by the OPEN FOR
 * BUSINESS toggle to swing between 'scheduled' and 'live'. .single()
 * surfaces a 0-rows-affected RLS miss as PGRST116 →
 * ScheduleNotFoundError so the optimistic UI hook can roll back and
 * refetch, rather than silently succeeding.
 */
export async function setTodayStatus(args: SetTodayStatusArgs): Promise<TruckSchedule> {
  const { data, error } = await supabase
    .from('truck_schedules')
    .update({ status: args.status })
    .eq('id', args.scheduleId)
    .select('*')
    .single();

  if (error) throw mapError(error);
  return data;
}
