import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../state/configureStore';
import { setBusinesses } from '../../state/pageSlice';
import type { Business } from '../../types/business';
import type { RequestHook } from '../../types/requestHook';
import { useAsyncAction } from '../useAsyncAction';

export const useBusinessesRetrieve = ({ showLoader = true, onDone, filter }: RequestHook) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(() => window.electronAPI.getAllBusinesses(filter), [filter]);
  const { data: businesses, execute } = useAsyncAction<Business[]>(asyncFn, { showLoader, onDone });

  useEffect(() => {
    if (!businesses) return;
    dispatch(setBusinesses(businesses));
  }, [businesses, dispatch]);

  return { businesses: businesses ?? [], execute };
};
