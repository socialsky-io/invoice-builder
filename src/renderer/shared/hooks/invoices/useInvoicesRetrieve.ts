import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../../state/configureStore';
import { setInvoices } from '../../../state/pageSlice';
import type { InvoiceType } from '../../enums/invoiceType';
import type { Invoice } from '../../types/invoice';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { uint8ArrayToDataUrl } from '../../utils/dataUrlFunctions';
import { useAsyncAction } from '../useAsyncAction';

interface UseInvoicesParams extends RequestHook<Response<Invoice[]>> {
  type: InvoiceType;
}

export const useInvoicesRetrieve = ({
  immediate = true,
  showLoader = true,
  type,
  filter,
  onDone
}: UseInvoicesParams) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(() => window.electronAPI.getAllInvoices(type, filter), [filter, type]);
  const { data: invoices, execute } = useAsyncAction<Response<Invoice[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });

  const prepareInvoices = async (invoices: Invoice[]) => {
    const serialized = await Promise.all(
      invoices.map(async b => ({
        ...b,
        businessLogoSnapshot: b.businessLogoSnapshot
          ? await uint8ArrayToDataUrl(b.businessLogoSnapshot, b.businessFileTypeSnapshot)
          : null
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
