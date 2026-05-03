import { useQuery } from '@tanstack/react-query';

import type { SavedLocation } from '@/lib/types';
import { fetchSavedLocations } from '@/services/savedLocations';
import { useAuthStore } from '@/stores/authStore';

/**
 * Reads the operator's saved-location chips for the Today screen.
 * Disabled until a session exists so we don't fire during the
 * auth-resolving flash.
 */
export function useSavedLocations() {
  const userId = useAuthStore((state) => state.session?.userId);
  return useQuery<SavedLocation[]>({
    queryKey: ['saved-locations', userId],
    queryFn: () => {
      if (!userId) return Promise.resolve([]);
      return fetchSavedLocations(userId);
    },
    enabled: !!userId,
  });
}
