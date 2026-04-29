// Street Fire palette — for use where NativeWind classes can't reach
// (e.g. native component props like ActivityIndicator `color`).
// All other styling should go through Tailwind tokens / CSS variables.

export const FIRE_ORANGE = '#FF5C00';
export const ORANGE_LIGHT = '#FF8A40';
export const SIGNAL_YELLOW = '#FFD23F';
export const ACTIVE_GREEN = '#2ECC71';
export const ALERT_RED = '#E74C3C';
export const APP_BLACK = '#0F0F0F';
export const CHARCOAL = '#1A1A1A';
export const GRAPHITE = '#252525';
export const MID = '#3A3A3A';
export const MUTED = '#888888';
export const WARM_CREAM = '#F5F0E8';

/**
 * CTA / button text only — crisp maximum-contrast white for labels on
 * Fire Orange / Charcoal / Alert Red / Active Green button fills. Do not
 * use for body copy, headings, or anywhere else in the app; those stay
 * on WARM_CREAM. Mirrors `typography.white` in `tailwind.config.js`.
 */
export const CTA_WHITE = '#FFFFFF';

/**
 * App-Black at ~60% alpha — used for floating chrome that overlays
 * arbitrary photos (truck profile back button, hero overlays, etc.)
 * so the chrome stays legible without fully blocking the image.
 */
export const APP_BLACK_SCRIM = '#0F0F0F99';
