import { useCallback } from 'react';
import type { CurrencyUpdate } from '../../types/currency';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
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
  const asyncFn = useCallback((): Promise<Response> => {
    if (!currency) return Promise.resolve({ success: false });
    return window.electronAPI.updateCurrency(currency);
  }, [currency]);

  const { data, loading, execute } = useAsyncAction<Response>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
