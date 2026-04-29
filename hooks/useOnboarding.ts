import { useCallback, useEffect, useState } from 'react';

import { isConsumerOnboardingComplete, markConsumerOnboardingComplete } from '@/lib/onboarding';

interface UseOnboardingResult {
  /** False until the AsyncStorage read settles. Mirrors the
   *  isResolving flag on useAuthStore so app/index.tsx can wait for
   *  both stores in one branch. */
  resolved: boolean;
  /** True when the consumer has completed onboarding on this device. */
  complete: boolean;
  /** Persists the flag and flips local state in one shot. */
  markComplete: () => Promise<void>;
}

export function useConsumerOnboarding(): UseOnboardingResult {
  const [resolved, setResolved] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    isConsumerOnboardingComplete().then((c) => {
      if (cancelled) return;
      setComplete(c);
      setResolved(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const markComplete = useCallback(async () => {
    await markConsumerOnboardingComplete();
    setComplete(true);
  }, []);

  return { resolved, complete, markComplete };
}
