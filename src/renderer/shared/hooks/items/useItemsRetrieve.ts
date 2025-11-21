import { useCallback, useEffect, useState } from 'react';
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
  const [finalItems, setFinalItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!items || !items.data) return;

    const modifiedItems = items.data.map(i => ({
      ...i,
      amount: i.amountCents ? i.amountCents / 100 : undefined
    }));

    dispatch(setItems(modifiedItems));
    setFinalItems(modifiedItems);
  }, [items, dispatch]);

  return { items: finalItems ?? [], execute };
};
