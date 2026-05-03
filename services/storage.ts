import { AppError, NetworkError, isNetworkError, type PostgrestLikeError } from '@/lib/errors';
import { supabase } from '@/services/supabase';

// First Storage-using service in the project. The bucket
// (`truck-covers`) and its RLS policies are created in the
// 20260503173933_create_truck_covers_bucket.sql migration.

export abstract class StorageError extends AppError {}
export class UnknownStorageError extends StorageError {}

export { NetworkError };

function mapError(err: PostgrestLikeError): AppError {
  if (isNetworkError(err)) return new NetworkError(err.message);
  return new UnknownStorageError(err.message);
}

const BUCKET = 'truck-covers';

interface UploadTruckCoverArgs {
  /** Used as the path prefix — must equal auth.uid() at write time, or
   *  the bucket's owner-insert RLS policy rejects the upload. */
  operatorId: string;
  /** Local URI returned by expo-image-picker
   *  (e.g. file:// on iOS, content:// on Android). */
  fileUri: string;
  /** MIME type from the picker asset. Falls back to image/jpeg if the
   *  picker didn't provide one. */
  contentType?: string;
}

/**
 * Uploads a cover photo to the truck-covers bucket and returns the
 * public URL ready to land in `trucks.cover_url`.
 *
 * Path layout: `<operatorId>/cover-<timestamp>.<ext>` — keeps repeat
 * uploads from the same operator from colliding while still grouping
 * their files in one folder. The bucket's owner-insert RLS scopes
 * writes to the operator's own UUID prefix; the path-prefix check
 * (`storage.foldername(name)[1] = auth.uid()::text`) enforces that.
 *
 * Errors:
 * - `NetworkError` — fetch / upload network failure.
 * - `UnknownStorageError` — RLS denial, oversized file, content-type
 *   rejection, or any other storage-side error.
 */
export async function uploadTruckCover(args: UploadTruckCoverArgs): Promise<string> {
  const { operatorId, fileUri, contentType } = args;

  // RN's fetch() resolves file:// and content:// URIs natively; the
  // resulting Blob carries the right bytes for Storage to consume.
  // expo-image-picker returns these URI shapes by default.
  let blob: Blob;
  try {
    const response = await fetch(fileUri);
    blob = await response.blob();
  } catch (err) {
    throw new NetworkError(err instanceof Error ? err.message : 'failed to read picked file');
  }

  // File extension from content type — falls back to jpg. Keeps the
  // Storage path human-skimmable in Studio without forcing a JS
  // dependency on something like mime-types.
  const ext = (() => {
    const ct = contentType ?? blob.type ?? 'image/jpeg';
    if (ct.includes('png')) return 'png';
    if (ct.includes('webp')) return 'webp';
    if (ct.includes('heic')) return 'heic';
    return 'jpg';
  })();

  const path = `${operatorId}/cover-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: contentType ?? blob.type ?? 'image/jpeg',
    // upsert=false matches the owner-insert RLS policy; if a path
    // collision ever happens (Date.now() resolution), surface it as
    // a clean error rather than silently overwriting.
    upsert: false,
  });

  if (uploadError) throw mapError(uploadError);

  // Bucket is public — getPublicUrl returns a stable CDN URL we can
  // store on trucks.cover_url and render unauthenticated on consumer
  // truck profiles.
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
