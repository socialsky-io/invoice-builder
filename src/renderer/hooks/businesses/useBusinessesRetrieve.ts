import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../state/configureStore';
import { setBusinesses } from '../../state/pageSlice';
import type { Business } from '../../types/business';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { uint8ArrayToDataUrl } from '../../utils/functions';
import { useAsyncAction } from '../useAsyncAction';

export const useBusinessesRetrieve = ({
  immediate = true,
  showLoader = true,
  filter,
  onDone
}: RequestHook<Response<Business[]>>) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(() => window.electronAPI.getAllBusinesses(filter), [filter]);
  const { data: businesses, execute } = useAsyncAction<Response<Business[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  const prepareBusinesses = async (businesses: Business[]) => {
    const serialized = await Promise.all(
      businesses.map(async b => ({
        ...b,
        logo: b.logo ? await uint8ArrayToDataUrl(b.logo) : null
      }))
    );
    return serialized;
  };

  useEffect(() => {
    if (!businesses || !businesses.data) return;

    (async () => {
      if (businesses && businesses.data) {
        const serializableBusinesses = await prepareBusinesses(businesses.data);
        dispatch(setBusinesses(serializableBusinesses));
      }
    })();
  }, [businesses, dispatch]);

  return { businesses: businesses?.data ?? [], execute };
};
