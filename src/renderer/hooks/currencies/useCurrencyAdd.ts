import { useCallback } from 'react';
import type { CurrencyAdd } from '../../types/currency';
import type { RequestHook } from '../../types/requestHook';
import { useAsyncAction } from '../useAsyncAction';

interface UseCurrencyAddParams extends RequestHook {
  currency?: CurrencyAdd;
}

export const useCurrencyAdd = ({ currency, immediate = true, showLoader = true, onDone }: UseCurrencyAddParams) => {
  const asyncFn = useCallback(() => {
    if (!currency) return Promise.resolve({ success: false });
    return window.electronAPI.addCurrency(currency);
  }, [currency]);

  const { data, loading, execute } = useAsyncAction<{ success: boolean; message?: string }>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
