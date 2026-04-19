import Constants from 'expo-constants';

export type AppVariant = 'consumer' | 'operator';

const VARIANTS: readonly AppVariant[] = ['consumer', 'operator'] as const;

export function getAppVariant(): AppVariant {
  const raw = Constants.expoConfig?.extra?.APP_VARIANT;
  return VARIANTS.includes(raw as AppVariant) ? (raw as AppVariant) : 'consumer';
}
