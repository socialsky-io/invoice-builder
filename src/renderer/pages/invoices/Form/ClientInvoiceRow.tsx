import { Box } from '@mui/material';
import { type FC } from 'react';
import type { InvoiceType } from '../../../shared/enums/invoiceType';
import type { InvoiceFromData } from '../../../shared/types/invoice';
import { ClientSelector } from './ClientSelector';
import { InvoiceInformationSelector } from './InvoiceInformationSelector';

interface Props {
  invoiceForm?: InvoiceFromData;
  onEditClients: () => void;
  onEditInvoiceInfo: () => void;
  type: InvoiceType;
}
export const ClientInvoiceRow: FC<Props> = ({ invoiceForm, onEditClients, onEditInvoiceInfo, type }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 2 }}>
      <ClientSelector onEdit={onEditClients} invoiceForm={invoiceForm} />

      <InvoiceInformationSelector onEdit={onEditInvoiceInfo} type={type} invoiceForm={invoiceForm} />
    </Box>
  );
};
