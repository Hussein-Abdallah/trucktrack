import AsyncStorage from '@react-native-async-storage/async-storage';

// Per-device, per-variant flag. Re-installing the app shows onboarding
// again — that matches user expectations and keeps the storage key
// scope narrow. TT-9 will add a parallel `onboarding:operator:complete`.
const CONSUMER_KEY = 'onboarding:consumer:complete';

export async function isConsumerOnboardingComplete(): Promise<boolean> {
  const value = await AsyncStorage.getItem(CONSUMER_KEY);
  return value === '1';
}

export async function markConsumerOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(CONSUMER_KEY, '1');
}
