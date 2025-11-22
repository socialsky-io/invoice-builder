import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../../state/configureStore';
import { setItems } from '../../../state/pageSlice';
import type { Item } from '../../types/item';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../useAsyncAction';

export const useItemsRetrieve = ({ showLoader = true, filter, onDone }: RequestHook<Response<Item[]>>) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(() => window.electronAPI.getAllItems(filter), [filter]);
  const { data: items, execute } = useAsyncAction<Response<Item[]>>(asyncFn, { showLoader, onDone });

  useEffect(() => {
    if (!items || !items.data) return;

    dispatch(setItems(items.data));
  }, [items, dispatch]);

  return { items: items?.data ?? [], execute };
};
