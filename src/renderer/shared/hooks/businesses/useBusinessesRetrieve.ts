import { useCallback } from 'react';
import type { Business } from '../../types/business';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../useAsyncAction';

export const useBusinessesRetrieve = ({
  immediate = true,
  showLoader = true,
  filter,
  onDone
}: RequestHook<Response<Business[]>>) => {
  const asyncFn = useCallback(() => window.electronAPI.getAllBusinesses(filter), [filter]);
  const { data: businesses, execute } = useAsyncAction<Response<Business[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  return { businesses: businesses?.data ?? [], execute };
};
