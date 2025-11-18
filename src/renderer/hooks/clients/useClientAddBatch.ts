import { useCallback } from 'react';
import type { ClientAdd } from '../../types/client';
import type { RequestHook } from '../../types/requestHook';
import { useAsyncAction } from '../useAsyncAction';

interface UseClientAddParams extends RequestHook {
  clients?: ClientAdd[];
}

export const useClientAddBatch = ({ clients, immediate = true, showLoader = true, onDone }: UseClientAddParams) => {
  const asyncFn = useCallback(() => {
    if (!clients) return Promise.resolve({ success: false });
    return window.electronAPI.addBatchClient(clients);
  }, [clients]);

  const { data, loading, execute } = useAsyncAction<{ success: boolean; message?: string }>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
