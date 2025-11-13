import { useCallback } from 'react';
import type { RequestHook } from '../../types/requestHook';
import { useAsyncAction } from '../useAsyncAction';

interface UseBusinessDeleteParams extends RequestHook {
  id: number;
}

export const useBusinessDelete = ({ id, immediate = true, showLoader = true, onDone }: UseBusinessDeleteParams) => {
  const asyncFn = useCallback(() => window.electronAPI.deleteBusiness(id), [id]);
  const { data, loading, execute } = useAsyncAction<{ success: boolean; message?: string }>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
