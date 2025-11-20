import { useCallback } from 'react';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../useAsyncAction';

interface UseItemDeleteParams extends RequestHook<Response<unknown>> {
  id: number;
}

export const useItemDelete = ({ id, immediate = true, showLoader = true, onDone }: UseItemDeleteParams) => {
  const asyncFn = useCallback(() => window.electronAPI.deleteItem(id), [id]);
  const { data, loading, execute } = useAsyncAction<Response<unknown>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
