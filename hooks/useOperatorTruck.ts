import { useQuery } from '@tanstack/react-query';

import type { Truck } from '@/lib/types';
import { fetchOperatorTruck } from '@/services/operatorTruck';
import { useAuthStore } from '@/stores/authStore';

/**
 * Reads the operator's owned truck (one truck per operator MVP).
 * Returns `data: null` when the operator hasn't created a truck yet —
 * the Today screen renders a "set up your truck" empty state in that
 * case. Disabled until a session exists so we don't fire the query
 * during the auth-resolving flash.
 */
export function useOperatorTruck() {
  const userId = useAuthStore((state) => state.session?.userId);
  return useQuery<Truck | null>({
    queryKey: ['operator-truck', userId],
    queryFn: () => {
      // Mirrors the useFollowedTrucks pattern — `enabled` below blocks
      // the call when userId is undefined, but TS still wants the
      // narrowing here.
      if (!userId) return Promise.resolve(null);
      return fetchOperatorTruck(userId);
    },
    enabled: !!userId,
  });
}
