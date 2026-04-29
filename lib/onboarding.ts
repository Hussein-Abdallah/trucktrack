import AsyncStorage from '@react-native-async-storage/async-storage';

// Per-device, per-variant flag. Re-installing the app shows onboarding
// again — that matches user expectations and keeps the storage key
// scope narrow. TT-9 will add a parallel `onboarding:operator:complete`.
const CONSUMER_KEY = 'onboarding:consumer:complete';

export async function isConsumerOnboardingComplete(): Promise<boolean> {
  // AsyncStorage failures (corruption, platform edge cases) must not
  // deadlock the splash screen. Treating any read error as "not yet
  // onboarded" sends the user through onboarding once more rather
  // than trapping them on the spinner; markComplete will recover the
  // flag on Continue.
  try {
    const value = await AsyncStorage.getItem(CONSUMER_KEY);
    return value === '1';
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[onboarding] AsyncStorage read failed:', err);
    return false;
  }
}

export async function markConsumerOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(CONSUMER_KEY, '1');
}
