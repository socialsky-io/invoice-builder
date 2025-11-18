import { useCallback } from 'react';
import type { CurrencyUpdate } from '../../types/currency';
import type { RequestHook } from '../../types/requestHook';
import { useAsyncAction } from '../useAsyncAction';

interface UseCurrencyUpdateParams extends RequestHook {
  currency?: CurrencyUpdate;
}

export const useCurrencyUpdate = ({
  currency,
  immediate = true,
  showLoader = true,
  onDone
}: UseCurrencyUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    if (!currency) return { success: false, message: 'No Currency provided' };
    return window.electronAPI.updateCurrency(currency);
  }, [currency]);

  const { data, loading, execute } = useAsyncAction<{ success: boolean; message?: string }>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
