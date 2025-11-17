import { useCallback } from 'react';
import type { Business } from '../../types/business';
import type { RequestHook } from '../../types/requestHook';
import { useAsyncAction } from '../useAsyncAction';

export const useBusinessesRetrieve = ({ showLoader = true, onDone, filter }: RequestHook) => {
  const asyncFn = useCallback(() => window.electronAPI.getAllBusinesses(filter), [filter]);
  const { data: businesses, execute } = useAsyncAction<Business[]>(asyncFn, { showLoader, onDone });

  return { businesses: businesses ?? [], execute };
};
