import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../state/configureStore';
import { setBusinesses } from '../../state/pageSlice';
import type { Business } from '../../types/business';
import type { RequestHook } from '../../types/requestHook';
import { uint8ArrayToDataUrl } from '../../utils/functions';
import { useAsyncAction } from '../useAsyncAction';

export const useBusinessesRetrieve = ({ showLoader = true, onDone, filter }: RequestHook) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(() => window.electronAPI.getAllBusinesses(filter), [filter]);
  const { data: businesses, execute } = useAsyncAction<Business[]>(asyncFn, { showLoader, onDone });

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
    if (!businesses) return;

    (async () => {
      const serializableBusinesses = await prepareBusinesses(businesses);
      dispatch(setBusinesses(serializableBusinesses));
    })();
  }, [businesses, dispatch]);

  return { businesses: businesses ?? [], execute };
};
