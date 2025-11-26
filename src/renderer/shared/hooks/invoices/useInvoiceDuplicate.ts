import { useCallback } from 'react';
import type { InvoiceType } from '../../enums/invoiceType';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../useAsyncAction';

interface UseInvoiceDuplicateParams extends RequestHook<Response<unknown>> {
  id: number;
  invoiceType: InvoiceType;
}

export const useInvoiceDuplicate = ({
  id,
  invoiceType,
  immediate = true,
  showLoader = true,
  onDone
}: UseInvoiceDuplicateParams) => {
  const asyncFn = useCallback(() => window.electronAPI.duplicateInvoice(id, invoiceType), [id, invoiceType]);
  const { data, loading, execute } = useAsyncAction<Response<unknown>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};
