import { useCallback } from 'react';
import type { BusinessAdd } from '../../types/business';
import type { RequestHook } from '../../types/requestHook';
import { useAsyncAction } from '../useAsyncAction';

interface UseBusinessAddParams extends RequestHook {
  businesses?: BusinessAdd[];
}

export const useBusinessAddBatch = ({
  businesses,
  immediate = true,
  showLoader = true,
  onDone
}: UseBusinessAddParams) => {
  const asyncFn = useCallback(() => {
    if (!businesses) return Promise.resolve({ success: false });
    return window.electronAPI.addBatchBusiness(businesses);
  }, [businesses]);

  const { data, loading, execute } = useAsyncAction<{ success: boolean; message?: string }>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
