import { QueryClient } from '@tanstack/react-query';

// Singleton — module-scoped so the cache survives screen navigation
// inside the app. Defaults tuned for mobile: short stale window so data
// refreshes on remount, single retry on transient failures, and no
// window-focus refetch (RN has no window focus event).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
