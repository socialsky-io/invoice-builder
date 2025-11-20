import { useCallback } from 'react';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../useAsyncAction';

interface UseInitDBParams extends RequestHook<Response<unknown>> {
  fullPath: string;
}

export const useDBInit = ({ fullPath, immediate = true, showLoader = true, onDone }: UseInitDBParams) => {
  const asyncFn = useCallback(() => window.electronAPI.initializeDatabase({ fullPath }), [fullPath]);
  const { data, execute } = useAsyncAction<Response<unknown>>(asyncFn, { showLoader, immediate, onDone });

  return { data, execute };
};
