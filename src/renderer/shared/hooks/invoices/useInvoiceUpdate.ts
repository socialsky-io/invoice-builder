import { useCallback } from 'react';
import type { InvoiceUpdate } from '../../types/invoice';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../useAsyncAction';

interface UseInvoiceUpdateParams extends RequestHook<Response<InvoiceUpdate>> {
  invoice?: InvoiceUpdate;
}

export const useInvoiceUpdate = ({ invoice, immediate = true, showLoader = true, onDone }: UseInvoiceUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<Response<InvoiceUpdate>> => {
    if (!invoice) return Promise.resolve({ success: false });
    return window.electronAPI.updateInvoice(invoice);
  }, [invoice]);

  const { data, loading, execute } = useAsyncAction<Response<InvoiceUpdate>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
