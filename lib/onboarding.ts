import AsyncStorage from '@react-native-async-storage/async-storage';

// Per-device, per-variant flags. Re-installing the app shows onboarding
// again — that matches user expectations and keeps the storage key
// scope narrow.
//
// Operator and consumer flags are independent so a multi-role account
// (consumer + operator on the same device) doesn't conflate the two
// flows. The operator app variant only checks the operator key; same
// for consumer.
const CONSUMER_KEY = 'onboarding:consumer:complete';
const OPERATOR_KEY = 'onboarding:operator:complete';

// AsyncStorage failures (corruption, platform edge cases) must not
// deadlock the splash screen. Treating any read error as "not yet
// onboarded" sends the user through onboarding once more rather than
// trapping them on the spinner; markComplete will recover the flag on
// Continue.
async function isFlagSet(key: string): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value === '1';
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[onboarding] AsyncStorage read failed:', err);
    return false;
  }
}

async function setFlag(key: string): Promise<void> {
  // Mirror the read path's fail-soft philosophy. A failed write
  // shouldn't block onboarding completion: the operator made it all
  // the way through the wizard, the trucks row exists, and a
  // permanent freeze on a transient AsyncStorage write is a worse
  // outcome than running onboarding once more on next launch (where
  // the auto-mark resilience effect catches the existing trucks row
  // and re-marks complete).
  try {
    await AsyncStorage.setItem(key, '1');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[onboarding] AsyncStorage write failed:', err);
  }
}

export async function isConsumerOnboardingComplete(): Promise<boolean> {
  return isFlagSet(CONSUMER_KEY);
}

export async function markConsumerOnboardingComplete(): Promise<void> {
  await setFlag(CONSUMER_KEY);
}

export async function isOperatorOnboardingComplete(): Promise<boolean> {
  return isFlagSet(OPERATOR_KEY);
}

export async function markOperatorOnboardingComplete(): Promise<void> {
  await setFlag(OPERATOR_KEY);
}
