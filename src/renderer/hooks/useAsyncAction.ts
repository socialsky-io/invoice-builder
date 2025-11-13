import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../state/configureStore';
import { addToast, disableLoadingCursor, enableLoadingCursor } from '../state/pageSlice';
import { useAsync } from './useAsync';

interface UseAsyncActionOptions<T> {
  showLoader?: boolean;
  immediate?: boolean;
  onDone?: (data: T) => void;
}

export const useAsyncAction = <T>(
  asyncFn: () => Promise<T>,
  { showLoader = true, immediate = true, onDone }: UseAsyncActionOptions<T> = {}
) => {
  const dispatch = useAppDispatch();

  const handleLoadingChange = useCallback(
    (isLoading: boolean) => {
      if (!showLoader) return;
      if (isLoading) dispatch(enableLoadingCursor());
      else dispatch(disableLoadingCursor());
    },
    [dispatch, showLoader]
  );

  const handleError = useCallback(
    (err: Error) => {
      dispatch(addToast({ message: err.message, severity: 'error' }));
    },
    [dispatch]
  );

  const { data, loading, execute } = useAsync<T>(asyncFn, {
    onLoadingChange: handleLoadingChange,
    onError: handleError,
    immediate
  });

  useEffect(() => {
    if (!loading && data !== null) {
      onDone?.(data);
    }
  }, [loading, data, onDone]);

  return { data, loading, execute };
};
