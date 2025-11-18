import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CRUDPage } from '../../components/crudPage/CRUDPage';
import { FilterType } from '../../enums/filterType';
import { useCurrenciesRetrieve } from '../../hooks/currencies/useCurrenciesRetrieve';
import { useCurrencyAdd } from '../../hooks/currencies/useCurrencyAdd';
import { useCurrencyAddBatch } from '../../hooks/currencies/useCurrencyAddBatch';
import { useCurrencyDelete } from '../../hooks/currencies/useCurrencyDelete';
import { useCurrencyUpdate } from '../../hooks/currencies/useCurrencyUpdate';
import type { Currency, CurrencyAdd, CurrencyUpdate } from '../../types/currency';
import type { Rows } from '../../types/excel';
import type { Filter } from '../../types/filter';
import { isCurrencyFromData } from '../../utils/functions';
import { Form } from './Form';
import { List } from './List';

export const CurrenciesPage: FC = () => {
  const { t } = useTranslation();
  const excelColumns = ['code', 'symbol', 'text', 'format'];
  const excelFileName = 'currencies';
  const excelTemplateData: Rows = [
    {
      code: 'USD',
      symbol: '$',
      text: 'United States Dollar',
      format: '$123'
    },
    {
      code: 'EUR',
      symbol: '€',
      text: 'Euro',
      format: '€123'
    }
  ];
  const filters: Filter[] = [
    { label: t('currencies.filter.allText'), description: undefined, value: FilterType.all, initial: true },
    {
      label: t('currencies.filter.atleastOneInvoiceText'),
      description: t('currencies.filter.atleastOneInvoiceDesc'),
      value: FilterType.atleastOneInvoice
    },
    {
      label: t('currencies.filter.noInvoicesText'),
      description: t('currencies.filter.noInvoicesDesc'),
      value: FilterType.noInvoices
    },
    {
      label: t('currencies.filter.noInvoices30Text'),
      description: t('currencies.filter.noInvoices30Desc'),
      value: FilterType.noInvoices30
    },
    {
      label: t('currencies.filter.noInvoices60Text'),
      description: t('currencies.filter.noInvoices60Desc'),
      value: FilterType.noInvoices60
    },
    {
      label: t('currencies.filter.noInvoices90Text'),
      description: t('currencies.filter.noInvoices90Desc'),
      value: FilterType.noInvoices90
    }
  ];

  return (
    <CRUDPage
      title={t('menuItems.currencies')}
      filters={filters}
      excelColumns={excelColumns}
      excelFileName={excelFileName}
      excelFormat={'xlsx'}
      excelTemplateData={excelTemplateData}
      useRetrieve={({ filter }) => {
        const { currencies, execute } = useCurrenciesRetrieve({ filter: filter });
        return { items: currencies, execute };
      }}
      useAdd={({ item, immediate, onDone }) => useCurrencyAdd({ currency: item as CurrencyAdd, immediate, onDone })}
      useAddBatch={({ item, immediate, onDone }) =>
        useCurrencyAddBatch({ currencies: item as CurrencyAdd[], immediate, onDone })
      }
      useUpdate={({ item, immediate, onDone }) =>
        useCurrencyUpdate({ currency: item as CurrencyUpdate, immediate, onDone })
      }
      useDelete={useCurrencyDelete}
      searchField={'text'}
      sortOptions={[
        { label: t('common.name'), value: 'text' },
        { label: t('common.lastUpdate'), value: 'updatedAt' }
      ]}
      noItemButtonText={t('currencies.add')}
      noItemText={t('currencies.noItem')}
      leftTitle={t('menuItems.currencies')}
      validateAndNormalize={data => {
        return data;
      }}
      renderListItem={(item, onEdit, onDelete) => (
        <List
          key={item.id}
          item={item}
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
