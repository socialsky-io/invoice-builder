import { useCallback } from 'react';
import type { CategoryAdd } from '../../types/category';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../useAsyncAction';

interface UseCategoryAddParams extends RequestHook<Response<CategoryAdd>> {
  category?: CategoryAdd;
}

export const useCategoryAdd = ({ category, immediate = true, showLoader = true, onDone }: UseCategoryAddParams) => {
  const asyncFn = useCallback(() => {
    if (!category) return Promise.resolve({ success: false });
    return window.electronAPI.addCategory(category);
  }, [category]);

  const { data, loading, execute } = useAsyncAction<Response<CategoryAdd>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
