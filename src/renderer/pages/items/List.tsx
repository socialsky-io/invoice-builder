import { type FC } from 'react';
import { GenericList } from '../../shared/components/genericList/GenericList';
import type { Item } from '../../shared/types/item';
import { formatAmount } from '../../shared/utils/functions';
import { useAppSelector } from '../../state/configureStore';
import { selectSettings } from '../../state/pageSlice';

interface Props {
  item: Item;
  selectedItem?: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
}
export const List: FC<Props> = ({ item, selectedItem, onEdit, onDelete }) => {
  const settings = useAppSelector(selectSettings);
  return (
    <GenericList
      item={item}
      selectedItem={selectedItem}
      onEdit={onEdit}
      onDelete={onDelete}
      getName={c => c.name}
      getAdditional={c => `${formatAmount(c.amount ?? 0, settings?.amountFormat)}`}
      getInvoiceCount={c => c.invoiceCount}
      getQuotesCount={c => c.quotesCount}
      getIsArchived={c => c.isArchived}
    />
  );
};
