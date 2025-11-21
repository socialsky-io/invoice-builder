import { type FC } from 'react';
import { GenericList } from '../../shared/components/genericList/GenericList';
import type { Unit } from '../../shared/types/unit';

interface Props {
  item: Unit;
  onEdit: (item: Unit) => void;
  onDelete: (id: number) => void;
}
export const List: FC<Props> = ({ item, onEdit, onDelete }) => {
  return (
    <GenericList
      item={item}
      onEdit={onEdit}
      onDelete={onDelete}
      getName={c => c.name}
      getInvoiceCount={c => c.invoiceCount}
      getQuotesCount={c => c.quotesCount}
      getIsArchived={c => c.isArchived}
    />
  );
};
