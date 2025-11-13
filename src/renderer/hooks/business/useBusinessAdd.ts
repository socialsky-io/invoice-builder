import { useCallback } from 'react';
import type { BusinessAdd } from '../../types/business';
import type { RequestHook } from '../../types/requestHook';
import { useAsyncAction } from '../useAsyncAction';

interface UseBusinessAddParams extends RequestHook {
  business?: BusinessAdd;
}

export const useBusinessAdd = ({ business, immediate = true, showLoader = true, onDone }: UseBusinessAddParams) => {
  const asyncFn = useCallback(() => {
    if (!business) return Promise.resolve({ success: false });
    return window.electronAPI.addBusiness(business);
  }, [business]);

  const { data, loading, execute } = useAsyncAction<{ success: boolean; message?: string }>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
