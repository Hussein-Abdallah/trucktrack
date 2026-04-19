import Constants from 'expo-constants';

export type AppVariant = 'consumer' | 'operator';

/**
 * Reads the runtime variant baked into the manifest by app.config.ts. Throws
 * in every environment (dev and prod) when the value is missing or unexpected
 * — a binary that cannot identify itself must not silently fall back to the
 * other app's shell. A production error boundary (Sentry) should capture this
 * and surface a "please reinstall" state rather than cross-routing users into
 * the wrong experience.
 */
export function getAppVariant(): AppVariant {
  const raw: unknown = Constants.expoConfig?.extra?.APP_VARIANT;
  if (raw === 'consumer' || raw === 'operator') return raw;
  throw new Error(
    `Invalid APP_VARIANT: ${String(raw)}. Expected 'consumer' or 'operator'. ` +
      `Check app.config.ts and the APP_VARIANT env var baked into this build.`,
  );
}
