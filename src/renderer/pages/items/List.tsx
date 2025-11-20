import { type FC } from 'react';
import { GenericList } from '../../components/genericList/GenericList';
import { useAppSelector } from '../../state/configureStore';
import { selectSettings } from '../../state/pageSlice';
import type { Item } from '../../types/item';
import { formatAmount } from '../../utils/functions';

interface Props {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
}
export const List: FC<Props> = ({ item, onEdit, onDelete }) => {
  const settings = useAppSelector(selectSettings);

  return (
    <GenericList
      item={item}
      onEdit={onEdit}
      onDelete={onDelete}
      getName={c => c.name}
      getAdditional={c => `${formatAmount(c.amount_cents ? c.amount_cents / 100 : 0, settings?.amountFormat)}`}
      getInvoiceCount={c => c.invoiceCount}
      getQuotesCount={c => c.quotesCount}
    />
  );
};
