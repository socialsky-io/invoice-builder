import { type FC } from 'react';
import { GenericList } from '../../components/genericList/GenericList';
import type { Currency } from '../../types/currency';

interface Props {
  item: Currency;
  onEdit: (item: Currency) => void;
  onDelete: (id: number) => void;
}
export const List: FC<Props> = ({ item, onEdit, onDelete }) => {
  return (
    <GenericList
      item={item}
      onEdit={onEdit}
      onDelete={onDelete}
      getName={c => c.text}
      getAdditional={c => `${c.code} / ${c.symbol}`}
      getInvoiceCount={c => c.invoiceCount}
      getQuotesCount={c => c.quotesCount}
    />
  );
};
