import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../state/configureStore';
import { setCategories } from '../../state/pageSlice';
import type { Category } from '../../types/category';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../useAsyncAction';

export const useCategoriesRetrieve = ({ showLoader = true, filter, onDone }: RequestHook<Response<Category[]>>) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(() => window.electronAPI.getAllCategories(filter), [filter]);
  const { data: categories, execute } = useAsyncAction<Response<Category[]>>(asyncFn, { showLoader, onDone });

  useEffect(() => {
    if (!categories || !categories.data) return;
    dispatch(setCategories(categories.data));
  }, [categories, dispatch]);

  return { categories: categories?.data ?? [], execute };
};
