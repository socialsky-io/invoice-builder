import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CRUDPage } from '../../shared/components/layout/crudPage/CRUDPage';
import { FilterType } from '../../shared/enums/filterType';
import { useItemAdd } from '../../shared/hooks/items/useItemAdd';
import { useItemAddBatch } from '../../shared/hooks/items/useItemAddBatch';
import { useItemDelete } from '../../shared/hooks/items/useItemDelete';
import { useItemsRetrieve } from '../../shared/hooks/items/useItemsRetrieve';
import { useItemUpdate } from '../../shared/hooks/items/useItemUpdate';
import type { Rows } from '../../shared/types/excel';
import type { Filter } from '../../shared/types/filter';
import type { Item, ItemAdd, ItemUpdate } from '../../shared/types/item';
import { createCommonFilters, createInvoiceFilters } from '../../shared/utils/filterSortFunctions';
import { isItemFromData } from '../../shared/utils/typeGuardFunctions';
import { Form } from './Form';
import { List } from './List';

export const ItemsPage: FC = () => {
  const { t } = useTranslation();

  const excelColumns = ['name', 'amount', 'unitName', 'categoryName', 'description', 'isArchived'];
  const excelFileName = 'items';
  const excelTemplateData: Rows = [
    {
      name: 'Paper A4',
      amount: '5',
      categoryName: 'Goods',
      unitName: 'pack',
      description: 'Standard white A4 paper',
      isArchived: false
    },
    {
      name: 'Pen Blue',
      amount: '150',
      categoryName: 'Goods',
      unitName: 'pcs',
      description: 'Blue ballpoint pen',
      isArchived: false
    }
  ];
  const filters: Filter[] = [
    ...createCommonFilters({ t, namespace: 'items', initial: FilterType.active }),
    ...createInvoiceFilters({ t, namespace: 'items' })
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

        return data;
      }}
      renderListItem={(item, selectedItem, onEdit, onDelete) => (
        <List
          key={item.id}
          item={item}
          selectedItem={selectedItem}
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
