import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../../state/configureStore';
import { setInvoices } from '../../../state/pageSlice';
import type { Invoice } from '../../types/invoice';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { uint8ArrayToDataUrl } from '../../utils/dataUrlFunctions';
import { useAsyncAction } from '../useAsyncAction';

export const useInvoicesRetrieve = ({
  immediate = true,
  showLoader = true,
  filter,
  onDone
}: RequestHook<Response<Invoice[]>>) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(() => window.electronAPI.getAllInvoices(filter), [filter]);
  const { data: invoices, execute } = useAsyncAction<Response<Invoice[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  const prepareInvoices = async (invoices: Invoice[]) => {
    const serialized = await Promise.all(
      invoices.map(async b => ({
        ...b,
        businessLogoSnapshot: b.businessLogoSnapshot ? await uint8ArrayToDataUrl(b.businessLogoSnapshot) : null
      }))
    );
    return serialized;
  };

  useEffect(() => {
    if (!invoices || !invoices.data) return;

    (async () => {
      if (invoices && invoices.data) {
        const serializableInvoices = await prepareInvoices(invoices.data);
        dispatch(setInvoices(serializableInvoices));
      }
    })();
  }, [invoices, dispatch]);

  return { invoices: invoices?.data ?? [], execute };
};
