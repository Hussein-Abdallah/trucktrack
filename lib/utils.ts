import { Linking, Platform } from 'react-native';

import type { AppLanguage, Coord } from '@/lib/types';

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Great-circle distance between two coordinates in kilometres.
 * Haversine formula — accurate to ~0.5% over short distances which is
 * all this app needs (truck-to-user across one city). Don't use for
 * cross-continental routes; the approximation degrades.
 */
export function haversineKm(a: Coord, b: Coord): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Locale-aware "X.X km" / "X,X km" formatter. French uses comma as the
 * decimal separator — "1,2 km" reads correctly to a French-Canadian eye
 * where "1.2 km" reads as the integer 12 with units. Falls back to one
 * decimal place; under 100 m we round to "0.1 km" rather than show
 * pseudo-precise "0.083 km".
 */
export function formatDistance(km: number, locale: AppLanguage): string {
  // Intl.NumberFormat does the en/fr decimal-separator switch correctly
  // and is bundled with Hermes — no extra polyfill needed on RN.
  const fmt = new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `${fmt.format(Math.max(km, 0.1))} km`;
}

/**
 * Open the native maps app with directions to a destination. iOS uses
 * Apple Maps (preinstalled, opens reliably without a Google account);
 * Android uses Google Maps. Falls back to Google Maps on the web view
 * if neither native app handles the URL — handled by the OS.
 *
 * `label` is shown as the destination name in Apple Maps' search box.
 * Google Maps doesn't honor a custom label here — it geocodes from
 * the lat/lng — so we omit it on the Android path.
 */
export async function openMapsDirections(opts: {
  lat: number;
  lng: number;
  label?: string;
}): Promise<void> {
  const { lat, lng, label } = opts;
  const encodedLabel = label ? encodeURIComponent(label) : '';
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${lat},${lng}${label ? `&q=${encodedLabel}` : ''}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  // Linking.openURL rejects when no app handles the URL or the user
  // cancels (rare for maps URLs since both platforms ship a default
  // handler). Swallow + log so an unhandled rejection doesn't bubble
  // up to the caller — the action is best-effort, not load-bearing.
  try {
    await Linking.openURL(url);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[openMapsDirections] failed to open URL', url, error);
  }
}
