import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../state/configureStore';
import { setClients } from '../../state/pageSlice';
import type { Business } from '../../types/business';
import type { RequestHook } from '../../types/requestHook';
import { useAsyncAction } from '../useAsyncAction';

export const useClientsRetrieve = ({ showLoader = true, filter }: RequestHook) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(() => window.electronAPI.getAllClients(filter), [filter]);
  const { data: clients, execute } = useAsyncAction<Business[]>(asyncFn, { showLoader });

  useEffect(() => {
    if (!clients) return;
    dispatch(setClients(clients));
  }, [clients, dispatch]);

  return { clients: clients ?? [], execute };
};
