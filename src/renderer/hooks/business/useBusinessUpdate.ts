import { useCallback } from 'react';
import type { BusinessUpdate } from '../../types/business';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
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
  const asyncFn = useCallback(async (): Promise<Response> => {
    if (!business) return Promise.resolve({ success: false });
    return window.electronAPI.updateBusiness(business);
  }, [business]);

  const { data, loading, execute } = useAsyncAction<Response>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
