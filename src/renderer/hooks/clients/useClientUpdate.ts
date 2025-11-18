import { useCallback } from 'react';
import type { ClientUpdate } from '../../types/client';
import type { RequestHook } from '../../types/requestHook';
import { useAsyncAction } from '../useAsyncAction';

interface UseClientUpdateParams extends RequestHook {
  client?: ClientUpdate;
}

export const useClientUpdate = ({ client, immediate = true, showLoader = true, onDone }: UseClientUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    if (!client) return { success: false, message: 'No client provided' };
    return window.electronAPI.updateClient(client);
  }, [client]);

  const { data, loading, execute } = useAsyncAction<{ success: boolean; message?: string }>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
