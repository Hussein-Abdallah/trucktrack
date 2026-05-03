import { AppError, NetworkError, isNetworkError, type PostgrestLikeError } from '@/lib/errors';
import type { Truck } from '@/lib/types';
import { supabase } from '@/services/supabase';

// Domain errors live in the service module that owns them — same
// pattern as services/savedLocations.ts. NetworkError stays in
// lib/errors so callers can `instanceof NetworkError` regardless of
// which service emitted it.

export abstract class TruckError extends AppError {}
export class UnknownTruckError extends TruckError {}
/**
 * Postgres unique_violation (23505) on `trucks_operator_id_unique`.
 * Distinct from UnknownTruckError so callers (TT-9 onboarding mutation)
 * can branch on `instanceof DuplicateTruckError` to converge on the
 * existing row instead of treating the race as a hard failure.
 */
export class DuplicateTruckError extends TruckError {}

export { NetworkError };

function mapError(err: PostgrestLikeError): AppError {
  if (isNetworkError(err)) return new NetworkError(err.message);
  if (err.code === '23505') return new DuplicateTruckError(err.message);
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

export interface CreateOperatorTruckArgs {
  operatorId: string;
  name: string;
  cuisineTags?: string[];
  description?: string | null;
  coverUrl?: string | null;
}

/**
 * Inserts the operator's truck row at the end of the onboarding wizard
 * (TT-9). Defaults `plan='free'` and `is_active=true` are applied by
 * the trucks table — we don't pass them here so a future plan/default
 * change at the schema layer doesn't require a parallel client update.
 *
 * Returns the inserted row so the caller can seed the
 * `['operator-truck', userId]` query cache + navigate to Today
 * without an extra refetch round-trip.
 */
export async function createOperatorTruck(args: CreateOperatorTruckArgs): Promise<Truck> {
  // Defensive trim — every caller in TT-9 already trims, but the
  // `trucks.name` CHECK doesn't reject leading/trailing whitespace,
  // so a future caller that forgets would land a row with `"  Joe's
  // Pizza  "` that renders weirdly on the consumer map.
  const trimmedName = args.name.trim();

  const { data, error } = await supabase
    .from('trucks')
    .insert({
      operator_id: args.operatorId,
      name: trimmedName,
      cuisine_tags: args.cuisineTags ?? [],
      description: args.description ?? null,
      cover_url: args.coverUrl ?? null,
    })
    .select('*')
    .single();

  if (error) throw mapError(error);
  return data;
}
