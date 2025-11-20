import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CRUDPage } from '../../components/crudPage/CRUDPage';
import { FilterType } from '../../enums/filterType';
import { useItemAdd } from '../../hooks/items/useItemAdd';
import { useItemAddBatch } from '../../hooks/items/useItemAddBatch';
import { useItemDelete } from '../../hooks/items/useItemDelete';
import { useItemsRetrieve } from '../../hooks/items/useItemsRetrieve';
import { useItemUpdate } from '../../hooks/items/useItemUpdate';
import type { Rows } from '../../types/excel';
import type { Filter } from '../../types/filter';
import type { Item, ItemAdd, ItemUpdate } from '../../types/item';
import { isItemFromData } from '../../utils/functions';
import { Form } from './Form';
import { List } from './List';

export const ItemsPage: FC = () => {
  const { t } = useTranslation();

  const excelColumns = ['name', 'amount', 'unitName', 'categoryName', 'description'];
  const excelFileName = 'items';
  const excelTemplateData: Rows = [
    {
      name: 'Paper A4',
      amount: '5',
      categoryName: 'Goods',
      unitName: 'pack',
      description: 'Standard white A4 paper'
    },
    {
      name: 'Pen Blue',
      amount: '150',
      categoryName: 'Goods',
      unitName: 'pcs',
      description: 'Blue ballpoint pen'
    }
  ];
  const filters: Filter[] = [
    { label: t('items.filter.allText'), description: undefined, value: FilterType.all, initial: true },
    {
      label: t('items.filter.atleastOneInvoiceText'),
      description: t('items.filter.atleastOneInvoiceDesc'),
      value: FilterType.atleastOneInvoice
    },
    {
      label: t('items.filter.noInvoicesText'),
      description: t('items.filter.noInvoicesDesc'),
      value: FilterType.noInvoices
    },
    {
      label: t('items.filter.noInvoices30Text'),
      description: t('items.filter.noInvoices30Desc'),
      value: FilterType.noInvoices30
    },
    {
      label: t('items.filter.noInvoices60Text'),
      description: t('items.filter.noInvoices60Desc'),
      value: FilterType.noInvoices60
    },
    {
      label: t('items.filter.noInvoices90Text'),
      description: t('items.filter.noInvoices90Desc'),
      value: FilterType.noInvoices90
    }
  ];

  return (
    <CRUDPage<Item, ItemAdd, ItemUpdate>
      title={t('items.title')}
      filters={filters}
      excelColumns={excelColumns}
      excelFileName={excelFileName}
      excelFormat={'xlsx'}
      excelTemplateData={excelTemplateData}
      useRetrieve={({ filter, onDone }) => {
        const { items, execute } = useItemsRetrieve({ filter: filter, onDone });
        return { items, execute };
      }}
      useAdd={({ item, immediate, onDone }) => useItemAdd({ item, immediate, onDone })}
      useAddBatch={({ item, immediate, onDone }) => useItemAddBatch({ items: item, immediate, onDone })}
      useUpdate={({ item, immediate, onDone }) => useItemUpdate({ item, immediate, onDone })}
      useDelete={useItemDelete}
      searchField={'name'}
      sortOptions={[
        { label: t('common.name'), value: 'name' },
        { label: t('common.lastUpdate'), value: 'updatedAt' }
      ]}
      noItemButtonText={t('items.add')}
      noItemText={t('items.noItem')}
      leftTitle={t('menuItems.items')}
      validateAndNormalize={async data => {
        if (!isItemFromData(data)) return;

        if (data.amount !== undefined && data.amount !== null) {
          const raw = data.amount;
          const parsed = typeof raw === 'number' ? raw : Number(String(raw).replace(/,/g, ''));
          if (!Number.isNaN(parsed)) {
            data.amountCents = parsed * 100;
          }
        }

        return data;
      }}
      renderListItem={(item, onEdit, onDelete) => (
        <List
          key={item.id}
          item={item}
          onEdit={(editItem: Item) => onEdit(editItem)}
          onDelete={(id: number) => onDelete(id)}
        />
      )}
      form={({ item, onChange }) => (
        <Form
          item={item}
          handleChange={d => {
            if (isItemFromData(d.item)) {
              onChange({
                changedData: d.item,
                isFormValid: d.isFormValid
              });
            }
          }}
        />
      )}
    />
  );
};
