import { AppError, NetworkError, isNetworkError, type PostgrestLikeError } from '@/lib/errors';
import type { SavedLocation } from '@/lib/types';
import { supabase } from '@/services/supabase';

// Domain errors extend the shared AppError. NetworkError is the one
// error every service can throw with identical semantics, so it lives
// in lib/errors and is re-exported here for ergonomic imports
// (`from '@/services/savedLocations'`) without forking class identity.

export abstract class SavedLocationError extends AppError {}

export class UnknownSavedLocationError extends SavedLocationError {}

export { NetworkError };

function mapError(err: PostgrestLikeError): AppError {
  if (isNetworkError(err)) return new NetworkError(err.message);
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

export type UpdateSavedLocationPatch = Partial<{
  name: string;
  location_label: string;
  location_lat: number;
  location_lng: number;
  default_open_time: string;
  default_close_time: string;
  display_order: number;
}>;

export async function updateSavedLocation(
  id: string,
  patch: UpdateSavedLocationPatch,
): Promise<SavedLocation> {
  // .select().single() forces PostgREST to surface a 0-rows-affected
  // RLS miss as PGRST116 instead of a silent success — matches the
  // pattern in services/profile.ts.
  const { data, error } = await supabase
    .from('operator_saved_locations')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw mapError(error);
  return data;
}

export async function deleteSavedLocation(id: string): Promise<void> {
  const { error } = await supabase.from('operator_saved_locations').delete().eq('id', id);
  if (error) throw mapError(error);
}
