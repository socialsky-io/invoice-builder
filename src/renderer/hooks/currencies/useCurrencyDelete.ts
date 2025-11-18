import { useCallback } from 'react';
import type { RequestHook } from '../../types/requestHook';
import { useAsyncAction } from '../useAsyncAction';

interface UseCurrencyDeleteParams extends RequestHook {
  id: number;
}

export const useCurrencyDelete = ({ id, immediate = true, showLoader = true, onDone }: UseCurrencyDeleteParams) => {
  const asyncFn = useCallback(() => window.electronAPI.deleteCurrency(id), [id]);
  const { data, loading, execute } = useAsyncAction<{ success: boolean; message?: string }>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
