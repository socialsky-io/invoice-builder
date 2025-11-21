import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../../state/configureStore';
import { setClients } from '../../../state/pageSlice';
import type { Client } from '../../types/client';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../useAsyncAction';

export const useClientsRetrieve = ({
  showLoader = true,
  immediate = true,
  filter,
  onDone
}: RequestHook<Response<Client[]>>) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(() => window.electronAPI.getAllClients(filter), [filter]);
  const { data: clients, execute } = useAsyncAction<Response<Client[]>>(asyncFn, { showLoader, immediate, onDone });

  useEffect(() => {
    if (!clients || !clients.data) return;
    dispatch(setClients(clients.data));
  }, [clients, dispatch]);

  return { clients: clients?.data ?? [], execute };
};
