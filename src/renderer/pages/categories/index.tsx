import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CRUDPage } from '../../components/crudPage/CRUDPage';
import { FilterType } from '../../enums/filterType';
import { useCategoriesRetrieve } from '../../hooks/categories/useCategoriesRetrieve';
import { useCategoryAdd } from '../../hooks/categories/useCategoryAdd';
import { useCategoryAddBatch } from '../../hooks/categories/useCategoryAddBatch';
import { useCategoryDelete } from '../../hooks/categories/useCategoryDelete';
import { useCategoryUpdate } from '../../hooks/categories/useCategoryUpdate';
import type { Category, CategoryAdd, CategoryUpdate } from '../../types/category';
import type { Rows } from '../../types/excel';
import type { Filter } from '../../types/filter';
import { isCategoryFromData } from '../../utils/functions';
import { Form } from './Form';
import { List } from './List';

export const CategoriesPage: FC = () => {
  const { t } = useTranslation();
  const excelColumns = ['name'];
  const excelFileName = 'categories';
  const excelTemplateData: Rows = [
    {
      name: 'Goods'
    },
    {
      name: 'Services'
    }
  ];
  const filters: Filter[] = [
    { label: t('categories.filter.allText'), description: undefined, value: FilterType.all, initial: true },
    {
      label: t('categories.filter.atleastOneInvoiceText'),
      description: t('categories.filter.atleastOneInvoiceDesc'),
      value: FilterType.atleastOneInvoice
    },
    {
      label: t('categories.filter.noInvoicesText'),
      description: t('categories.filter.noInvoicesDesc'),
      value: FilterType.noInvoices
    },
    {
      label: t('categories.filter.noInvoices30Text'),
      description: t('categories.filter.noInvoices30Desc'),
      value: FilterType.noInvoices30
    },
    {
      label: t('categories.filter.noInvoices60Text'),
      description: t('categories.filter.noInvoices60Desc'),
      value: FilterType.noInvoices60
    },
    {
      label: t('categories.filter.noInvoices90Text'),
      description: t('categories.filter.noInvoices90Desc'),
      value: FilterType.noInvoices90
    }
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
      renderListItem={(item, onEdit, onDelete) => (
        <List
          key={item.id}
          item={item}
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
