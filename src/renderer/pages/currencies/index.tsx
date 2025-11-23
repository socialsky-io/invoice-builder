import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CRUDPage } from '../../shared/components/layout/crudPage/CRUDPage';
import { FilterType } from '../../shared/enums/filterType';
import { useCurrenciesRetrieve } from '../../shared/hooks/currencies/useCurrenciesRetrieve';
import { useCurrencyAdd } from '../../shared/hooks/currencies/useCurrencyAdd';
import { useCurrencyAddBatch } from '../../shared/hooks/currencies/useCurrencyAddBatch';
import { useCurrencyDelete } from '../../shared/hooks/currencies/useCurrencyDelete';
import { useCurrencyUpdate } from '../../shared/hooks/currencies/useCurrencyUpdate';
import type { Currency, CurrencyAdd, CurrencyUpdate } from '../../shared/types/currency';
import type { Rows } from '../../shared/types/excel';
import type { Filter } from '../../shared/types/filter';
import { createCommonFilters, createInvoiceFilters, isCurrencyFromData } from '../../shared/utils/functions';
import { Form } from './Form';
import { List } from './List';

export const CurrenciesPage: FC = () => {
  const { t } = useTranslation();
  const excelColumns = ['code', 'symbol', 'text', 'format', 'subunit', 'isArchived'];
  const excelFileName = 'currencies';
  const excelTemplateData: Rows = [
    {
      code: 'USD',
      symbol: '$',
      text: 'United States Dollar',
      format: '{symbol}{amount}',
      subunit: 100,
      isArchived: false
    },
    {
      code: 'EUR',
      symbol: '€',
      text: 'Euro',
      subunit: 100,
      format: '{symbol}{amount}',
      isArchived: false
    }
  ];
  const filters: Filter[] = [
    ...createCommonFilters({ t, namespace: 'currencies', initial: FilterType.active }),
    ...createInvoiceFilters({ t, namespace: 'currencies' })
  ];

  return (
    <CRUDPage<Currency, CurrencyAdd, CurrencyUpdate>
      title={t('currencies.title')}
      filters={filters}
      excelColumns={excelColumns}
      excelFileName={excelFileName}
      excelFormat={'xlsx'}
      excelTemplateData={excelTemplateData}
      useRetrieve={({ filter, onDone }) => {
        const { currencies, execute } = useCurrenciesRetrieve({ filter: filter, onDone });
        return { items: currencies, execute };
      }}
      useAdd={({ item, immediate, onDone }) => useCurrencyAdd({ currency: item, immediate, onDone })}
      useAddBatch={({ item, immediate, onDone }) => useCurrencyAddBatch({ currencies: item, immediate, onDone })}
      useUpdate={({ item, immediate, onDone }) => useCurrencyUpdate({ currency: item, immediate, onDone })}
      useDelete={useCurrencyDelete}
      searchField={'text'}
      sortOptions={[
        { label: t('common.text'), value: 'text' },
        { label: t('common.lastUpdate'), value: 'updatedAt' }
      ]}
      noItemButtonText={t('currencies.add')}
      noItemText={t('currencies.noItem')}
      leftTitle={t('menuItems.currencies')}
      validateAndNormalize={async data => {
        if (!isCurrencyFromData(data)) return;
        return data;
      }}
      renderListItem={(item, selectedItem, onEdit, onDelete) => (
        <List
          key={item.id}
          item={item}
          selectedItem={selectedItem}
          onEdit={(editItem: Currency) => onEdit(editItem)}
          onDelete={(id: number) => onDelete(id)}
        />
      )}
      form={({ item, onChange }) => (
        <Form
          currency={item}
          handleChange={d => {
            if (isCurrencyFromData(d.currency)) {
              onChange({
                changedData: d.currency,
                isFormValid: d.isFormValid
              });
            }
          }}
        />
      )}
    />
  );
};
