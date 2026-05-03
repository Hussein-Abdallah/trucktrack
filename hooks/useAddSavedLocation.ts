import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { SavedLocation } from '@/lib/types';
import { addSavedLocation, type AddSavedLocationArgs } from '@/services/savedLocations';

/**
 * Wraps addSavedLocation in a mutation. Invalidates the saved-locations
 * cache for the operator on success so the new chip appears in the grid
 * immediately.
 */
export function useAddSavedLocation() {
  const queryClient = useQueryClient();
  return useMutation<SavedLocation, Error, AddSavedLocationArgs>({
    mutationFn: (args) => addSavedLocation(args),
    onSuccess: (_row, { operatorId }) => {
      void queryClient.invalidateQueries({ queryKey: ['saved-locations', operatorId] });
    },
  });
}
