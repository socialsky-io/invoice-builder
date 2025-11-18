import { useCallback } from 'react';
import type { CurrencyAdd } from '../../types/currency';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../useAsyncAction';

interface UseCurrencyAddParams extends RequestHook {
  currencies?: CurrencyAdd[];
}

export const useCurrencyAddBatch = ({
  currencies,
  immediate = true,
  showLoader = true,
  onDone
}: UseCurrencyAddParams) => {
  const asyncFn = useCallback(() => {
    if (!currencies) return Promise.resolve({ success: false });
    return window.electronAPI.addBatchCurrency(currencies);
  }, [currencies]);

  const { data, loading, execute } = useAsyncAction<Response>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
