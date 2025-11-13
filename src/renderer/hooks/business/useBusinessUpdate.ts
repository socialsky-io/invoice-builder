import { useCallback } from 'react';
import type { BusinessUpdate } from '../../types/business';
import type { RequestHook } from '../../types/requestHook';
import { useAsyncAction } from '../useAsyncAction';

interface UseBusinessUpdateParams extends RequestHook {
  business?: BusinessUpdate;
}

export const useBusinessUpdate = ({
  business,
  immediate = true,
  showLoader = true,
  onDone
}: UseBusinessUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    if (!business) return { success: false, message: 'No business provided' };
    return window.electronAPI.updateBusiness(business);
  }, [business]);

  const { data, loading, execute } = useAsyncAction<{ success: boolean; message?: string }>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
