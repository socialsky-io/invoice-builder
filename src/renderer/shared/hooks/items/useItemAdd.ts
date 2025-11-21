import { useCallback } from 'react';
import type { ItemAdd } from '../../types/item';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../useAsyncAction';

interface UseItemAddParams extends RequestHook<Response<ItemAdd>> {
  item?: ItemAdd;
}

export const useItemAdd = ({ item, immediate = true, showLoader = true, onDone }: UseItemAddParams) => {
  const asyncFn = useCallback(() => {
    if (!item) return Promise.resolve({ success: false });
    return window.electronAPI.addItem(item);
  }, [item]);

  const { data, loading, execute } = useAsyncAction<Response<ItemAdd>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
