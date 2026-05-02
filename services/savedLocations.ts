import { AppError, NetworkError, isNetworkError, type PostgrestLikeError } from '@/lib/errors';
import type { SavedLocation } from '@/lib/types';
import { supabase } from '@/services/supabase';

// Domain errors extend the shared AppError. NetworkError is the one
// error every service can throw with identical semantics, so it lives
// in lib/errors and is re-exported here for ergonomic imports
// (`from '@/services/savedLocations'`) without forking class identity.

export abstract class SavedLocationError extends AppError {}

// PGRST116 = "0 rows matched" — surfaced via .select().single() chained
// on update / delete. Distinct from UnknownSavedLocationError so callers
// can branch ("this location no longer exists, refresh the chip grid")
// vs. a real server fault.
export class SavedLocationNotFoundError extends SavedLocationError {}
export class UnknownSavedLocationError extends SavedLocationError {}

export { NetworkError };

function mapError(err: PostgrestLikeError): AppError {
  if (isNetworkError(err)) return new NetworkError(err.message);
  if (err.code === 'PGRST116') return new SavedLocationNotFoundError(err.message);
  return new UnknownSavedLocationError(err.message);
}

/**
 * Fetches the calling operator's saved locations, ordered for the
 * Today screen's chip grid. RLS scopes the result to the caller's rows;
 * the explicit operator_id filter pushes a server-side index lookup.
 */
export async function fetchSavedLocations(operatorId: string): Promise<SavedLocation[]> {
  const { data, error } = await supabase
    .from('operator_saved_locations')
    .select('*')
    .eq('operator_id', operatorId)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw mapError(error);
  return data ?? [];
}

export interface AddSavedLocationArgs {
  operatorId: string;
  name: string;
  locationLabel: string;
  lat: number;
  lng: number;
  /** HH:mm:ss or HH:mm. */
  defaultOpenTime: string;
  /** HH:mm:ss or HH:mm. */
  defaultCloseTime: string;
  displayOrder?: number;
}

export async function addSavedLocation(args: AddSavedLocationArgs): Promise<SavedLocation> {
  const { data, error } = await supabase
    .from('operator_saved_locations')
    .insert({
      operator_id: args.operatorId,
      name: args.name,
      location_label: args.locationLabel,
      location_lat: args.lat,
      location_lng: args.lng,
      default_open_time: args.defaultOpenTime,
      default_close_time: args.defaultCloseTime,
      display_order: args.displayOrder ?? 0,
    })
    .select('*')
    .single();

  if (error) throw mapError(error);
  return data;
}

// camelCase to match AddSavedLocationArgs — callers don't need to flip
// naming conventions between add and update. The implementation maps
// to snake_case before passing to PostgREST.
export type UpdateSavedLocationPatch = Partial<{
  name: string;
  locationLabel: string;
  lat: number;
  lng: number;
  /** HH:mm:ss or HH:mm. */
  defaultOpenTime: string;
  /** HH:mm:ss or HH:mm. */
  defaultCloseTime: string;
  displayOrder: number;
}>;

interface SavedLocationUpdateRow {
  name?: string;
  location_label?: string;
  location_lat?: number;
  location_lng?: number;
  default_open_time?: string;
  default_close_time?: string;
  display_order?: number;
}

export async function updateSavedLocation(
  id: string,
  patch: UpdateSavedLocationPatch,
): Promise<SavedLocation> {
  // Build the DB-shape object only including provided keys so PostgREST
  // doesn't overwrite columns the caller didn't intend to touch.
  const row: SavedLocationUpdateRow = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.locationLabel !== undefined) row.location_label = patch.locationLabel;
  if (patch.lat !== undefined) row.location_lat = patch.lat;
  if (patch.lng !== undefined) row.location_lng = patch.lng;
  if (patch.defaultOpenTime !== undefined) row.default_open_time = patch.defaultOpenTime;
  if (patch.defaultCloseTime !== undefined) row.default_close_time = patch.defaultCloseTime;
  if (patch.displayOrder !== undefined) row.display_order = patch.displayOrder;

  // .select().single() forces PostgREST to surface a 0-rows-affected
  // RLS miss as PGRST116 instead of a silent success — matches the
  // pattern in services/profile.ts. mapError converts that to
  // SavedLocationNotFoundError for distinguishable handling.
  const { data, error } = await supabase
    .from('operator_saved_locations')
    .update(row)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw mapError(error);
  return data;
}

export async function deleteSavedLocation(id: string): Promise<void> {
  // .select('id').single() forces PostgREST to surface the no-op
  // delete case (id not found OR RLS filter excludes the row) as
  // PGRST116 instead of returning success with zero rows. Matches the
  // same defense applied to updateSavedLocation above and the
  // services/profile.ts:updateProfileLanguage pattern.
  const { error } = await supabase
    .from('operator_saved_locations')
    .delete()
    .eq('id', id)
    .select('id')
    .single();
  if (error) throw mapError(error);
}
