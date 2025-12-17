import type { FC } from 'react';
import type { InvoiceType } from '../../../shared/enums/invoiceType';
import type { InvoiceFromData } from '../../../shared/types/invoice';

interface Props {
  invoiceForm?: InvoiceFromData;
  type: InvoiceType;
  setInvoiceForm?: React.Dispatch<React.SetStateAction<InvoiceFromData | undefined>>;
}
export const InvoicesPreview: FC<Props> = ({ setInvoiceForm = () => {}, invoiceForm, type }) => {
  return <>test</>;
};
