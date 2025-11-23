import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CRUDPage } from '../../shared/components/layout/crudPage/CRUDPage';
import { FilterType } from '../../shared/enums/filterType';
import { useCategoriesRetrieve } from '../../shared/hooks/categories/useCategoriesRetrieve';
import { useCategoryAdd } from '../../shared/hooks/categories/useCategoryAdd';
import { useCategoryAddBatch } from '../../shared/hooks/categories/useCategoryAddBatch';
import { useCategoryDelete } from '../../shared/hooks/categories/useCategoryDelete';
import { useCategoryUpdate } from '../../shared/hooks/categories/useCategoryUpdate';
import type { Category, CategoryAdd, CategoryUpdate } from '../../shared/types/category';
import type { Rows } from '../../shared/types/excel';
import type { Filter } from '../../shared/types/filter';
import { createCommonFilters, createInvoiceFilters, isCategoryFromData } from '../../shared/utils/functions';
import { Form } from './Form';
import { List } from './List';

export const CategoriesPage: FC = () => {
  const { t } = useTranslation();
  const excelColumns = ['name', 'isArchived'];
  const excelFileName = 'categories';
  const excelTemplateData: Rows = [
    {
      name: 'Goods',
      isArchived: false
    },
    {
      name: 'Services',
      isArchived: false
    }
  ];
  const filters: Filter[] = [
    ...createCommonFilters({ t, namespace: 'categories', initial: FilterType.active }),
    ...createInvoiceFilters({ t, namespace: 'categories' })
  ];

  return (
    <CRUDPage<Category, CategoryAdd, CategoryUpdate>
      title={t('categories.title')}
      filters={filters}
      excelColumns={excelColumns}
      excelFileName={excelFileName}
      excelFormat={'xlsx'}
      excelTemplateData={excelTemplateData}
      useRetrieve={({ filter, onDone }) => {
        const { categories, execute } = useCategoriesRetrieve({ filter: filter, onDone });
        return { items: categories, execute };
      }}
      useAdd={({ item, immediate, onDone }) => useCategoryAdd({ category: item, immediate, onDone })}
      useAddBatch={({ item, immediate, onDone }) => useCategoryAddBatch({ categories: item, immediate, onDone })}
      useUpdate={({ item, immediate, onDone }) => useCategoryUpdate({ category: item, immediate, onDone })}
      useDelete={useCategoryDelete}
      searchField={'name'}
      sortOptions={[
        { label: t('common.name'), value: 'name' },
        { label: t('common.lastUpdate'), value: 'updatedAt' }
      ]}
      noItemButtonText={t('categories.add')}
      noItemText={t('categories.noItem')}
      leftTitle={t('menuItems.categories')}
      validateAndNormalize={async data => {
        if (!isCategoryFromData(data)) return;
        return data;
      }}
      renderListItem={(item, selectedItem, onEdit, onDelete) => (
        <List
          key={item.id}
          item={item}
          selectedItem={selectedItem}
          onEdit={(editItem: Category) => onEdit(editItem)}
          onDelete={(id: number) => onDelete(id)}
        />
      )}
      form={({ item, onChange }) => (
        <Form
          category={item}
          handleChange={d => {
            if (isCategoryFromData(d.category)) {
              onChange({
                changedData: d.category,
                isFormValid: d.isFormValid
              });
            }
          }}
        />
      )}
    />
  );
};
