import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../state/configureStore';
import { setCurrencies } from '../../state/pageSlice';
import type { Currency } from '../../types/currency';
import type { RequestHook } from '../../types/requestHook';
import { useAsyncAction } from '../useAsyncAction';

export const useCurrenciesRetrieve = ({ showLoader = true, filter }: RequestHook) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(() => window.electronAPI.getAllCurrencies(filter), [filter]);
  const { data: currencies, execute } = useAsyncAction<Currency[]>(asyncFn, { showLoader });

  useEffect(() => {
    if (!currencies) return;
    dispatch(setCurrencies(currencies));
  }, [currencies, dispatch]);

  return { currencies: currencies ?? [], execute };
};
