import { useCallback, useEffect, useState } from 'react';

import {
  isConsumerOnboardingComplete,
  isOperatorOnboardingComplete,
  markConsumerOnboardingComplete,
  markOperatorOnboardingComplete,
} from '@/lib/onboarding';

interface UseOnboardingResult {
  /** False until the AsyncStorage read settles. Mirrors the
   *  isResolving flag on useAuthStore so app/index.tsx can wait for
   *  both stores in one branch. */
  resolved: boolean;
  /** True when the user has completed onboarding for this variant on
   *  this device. */
  complete: boolean;
  /** Persists the flag and flips local state in one shot. */
  markComplete: () => Promise<void>;
}

/**
 * Generic flag-backed onboarding hook factory. The two exported hooks
 * (`useConsumerOnboarding` and `useOperatorOnboarding`) wrap this with
 * the right read/write pair so callers don't have to think about
 * which AsyncStorage key applies.
 */
function useOnboardingFlag(
  isComplete: () => Promise<boolean>,
  markCompleteFn: () => Promise<void>,
): UseOnboardingResult {
  const [resolved, setResolved] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    isComplete().then((c) => {
      if (cancelled) return;
      setComplete(c);
      setResolved(true);
    });
    return () => {
      cancelled = true;
    };
  }, [isComplete]);

  const markComplete = useCallback(async () => {
    await markCompleteFn();
    setComplete(true);
  }, [markCompleteFn]);

  return { resolved, complete, markComplete };
}

export function useConsumerOnboarding(): UseOnboardingResult {
  return useOnboardingFlag(isConsumerOnboardingComplete, markConsumerOnboardingComplete);
}

export function useOperatorOnboarding(): UseOnboardingResult {
  return useOnboardingFlag(isOperatorOnboardingComplete, markOperatorOnboardingComplete);
}
