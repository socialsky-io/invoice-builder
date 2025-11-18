import { type FC } from 'react';
import { GenericList } from '../../components/genericList/GenericList';
import type { Client } from '../../types/client';

interface Props {
  item: Client;
  onEdit: (item: Client) => void;
  onDelete: (id: number) => void;
}
export const List: FC<Props> = ({ item, onEdit, onDelete }) => {
  return (
    <GenericList
      item={item}
      onEdit={onEdit}
      onDelete={onDelete}
      getShortName={c => c.shortName}
      getName={c => c.name}
      getEmail={c => c.email}
      getPhone={c => c.phone}
      getInvoiceCount={c => c.invoiceCount}
      getQuotesCount={c => c.quotesCount}
    />
  );
};
