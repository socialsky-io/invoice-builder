import { useCallback } from 'react';
import type { RequestHook } from '../../types/requestHook';
import { useAsyncAction } from '../useAsyncAction';

interface UseClientDeleteParams extends RequestHook {
  id: number;
}

export const useClientDelete = ({ id, immediate = true, showLoader = true, onDone }: UseClientDeleteParams) => {
  const asyncFn = useCallback(() => window.electronAPI.deleteClient(id), [id]);
  const { data, loading, execute } = useAsyncAction<{ success: boolean; message?: string }>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
