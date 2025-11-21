import { type FC } from 'react';
import { GenericList } from '../../components/genericList/GenericList';
import type { Business } from '../../types/business';

interface Props {
  item: Business;
  onEdit: (item: Business) => void;
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
      getIsArchived={c => c.isArchived}
    />
  );
};
