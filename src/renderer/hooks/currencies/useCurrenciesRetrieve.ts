import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../state/configureStore';
import { setCurrencies } from '../../state/pageSlice';
import type { Currency } from '../../types/currency';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../useAsyncAction';

export const useCurrenciesRetrieve = ({
  showLoader = true,
  immediate = true,
  filter,
  onDone
}: RequestHook<Response<Currency[]>>) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(() => window.electronAPI.getAllCurrencies(filter), [filter]);
  const { data: currencies, execute } = useAsyncAction<Response<Currency[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  useEffect(() => {
    if (!currencies || !currencies.data) return;
    dispatch(setCurrencies(currencies.data));
  }, [currencies, dispatch]);

  return { currencies: currencies?.data ?? [], execute };
};
