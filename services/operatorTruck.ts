import { AppError, NetworkError, isNetworkError, type PostgrestLikeError } from '@/lib/errors';
import type { Truck } from '@/lib/types';
import { supabase } from '@/services/supabase';

// Domain errors live in the service module that owns them — same
// pattern as services/savedLocations.ts. NetworkError stays in
// lib/errors so callers can `instanceof NetworkError` regardless of
// which service emitted it.

export abstract class TruckError extends AppError {}
export class UnknownTruckError extends TruckError {}

export { NetworkError };

function mapError(err: PostgrestLikeError): AppError {
  if (isNetworkError(err)) return new NetworkError(err.message);
  return new UnknownTruckError(err.message);
}

/**
 * Fetches the operator's owned truck (one truck per operator MVP).
 * Returns null if the operator hasn't set up a truck yet — the Today
 * screen renders a "set up your truck" empty state in that case.
 *
 * RLS scopes the result to rows the caller can read; the explicit
 * operator_id eq pushes a server-side index lookup
 * (trucks_operator_id_idx).
 */
export async function fetchOperatorTruck(operatorId: string): Promise<Truck | null> {
  const { data, error } = await supabase
    .from('trucks')
    .select('*')
    .eq('operator_id', operatorId)
    .maybeSingle();

  if (error) throw mapError(error);
  return data;
}
