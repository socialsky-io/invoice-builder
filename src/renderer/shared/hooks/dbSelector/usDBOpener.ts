import { useCallback } from 'react';
import type { DBSelector } from '../../types/dbSelector';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../useAsyncAction';

export const usDBOpener = ({ showLoader = true, immediate = true, onDone }: RequestHook<Response<DBSelector>>) => {
  const asyncFn = useCallback(() => window.electronAPI.openDatabase(), []);
  const { data, execute } = useAsyncAction<Response<DBSelector>>(asyncFn, { showLoader, immediate, onDone });

  return { data, execute };
};
