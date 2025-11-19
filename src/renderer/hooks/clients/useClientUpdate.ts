import { useCallback } from 'react';
import type { ClientUpdate } from '../../types/client';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../useAsyncAction';

interface UseClientUpdateParams extends RequestHook<Response<ClientUpdate>> {
  client?: ClientUpdate;
}

export const useClientUpdate = ({ client, immediate = true, showLoader = true, onDone }: UseClientUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<ClientUpdate>> => {
    if (!client) return Promise.resolve({ success: false });
    return window.electronAPI.updateClient(client);
  }, [client]);

  const { data, loading, execute } = useAsyncAction<Response<ClientUpdate>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
