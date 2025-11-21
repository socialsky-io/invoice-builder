import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CRUDPage } from '../../components/crudPage/CRUDPage';
import { useInvoicesRetrieve } from '../../hooks/invoices/useInvoicesRetrieve';
import type { Invoice, InvoiceAdd, InvoiceUpdate } from '../../types/invoice';
import { List } from './List';

export const InvoicesPage: FC = () => {
  const { t } = useTranslation();
  // const excelColumns = ['code', 'symbol', 'text', 'format', 'isArchived'];
  // const excelFileName = 'currencies';
  // const excelTemplateData: Rows = [
  //   {
  //     code: 'USD',
  //     symbol: '$',
  //     text: 'United States Dollar',
  //     format: '{symbol}{amount}',
  //     isArchived: false
  //   },
  //   {
  //     code: 'EUR',
  //     symbol: '€',
  //     text: 'Euro',
  //     format: '{symbol}{amount}',
  //     isArchived: false
  //   }
  // ];
  // const filters: Filter[] = [
  //   { label: t('currencies.filter.allText'), description: undefined, value: FilterType.all },
  //   {
  //     label: t('currencies.filter.activeText'),
  //     description: t('currencies.filter.activeDesc'),
  //     value: FilterType.active,
  //     initial: true
  //   },
  //   {
  //     label: t('currencies.filter.archivedText'),
  //     description: t('currencies.filter.archivedDesc'),
  //     value: FilterType.archived
  //   },
  //   {
  //     label: t('currencies.filter.atleastOneInvoiceText'),
  //     description: t('currencies.filter.atleastOneInvoiceDesc'),
  //     value: FilterType.atleastOneInvoice
  //   },
  //   {
  //     label: t('currencies.filter.noInvoicesText'),
  //     description: t('currencies.filter.noInvoicesDesc'),
  //     value: FilterType.noInvoices
  //   },
  //   {
  //     label: t('currencies.filter.noInvoices30Text'),
  //     description: t('currencies.filter.noInvoices30Desc'),
  //     value: FilterType.noInvoices30
  //   },
  //   {
  //     label: t('currencies.filter.noInvoices60Text'),
  //     description: t('currencies.filter.noInvoices60Desc'),
  //     value: FilterType.noInvoices60
  //   },
  //   {
  //     label: t('currencies.filter.noInvoices90Text'),
  //     description: t('currencies.filter.noInvoices90Desc'),
  //     value: FilterType.noInvoices90
  //   }
  // ];

  return (
    <CRUDPage<Invoice, InvoiceAdd, InvoiceUpdate>
      title={t('invoices.title')}
      // filters={filters}
      // excelColumns={excelColumns}
      // excelFileName={excelFileName}
      // excelFormat={'xlsx'}
      // excelTemplateData={excelTemplateData}
      useRetrieve={({ filter, onDone }) => {
        const { invoices, execute } = useInvoicesRetrieve({ filter: filter, onDone });
        return { items: invoices, execute };
      }}
      // useAdd={({ item, immediate, onDone }) => useCurrencyAdd({ currency: item, immediate, onDone })}
      // useAddBatch={({ item, immediate, onDone }) => useCurrencyAddBatch({ currencies: item, immediate, onDone })}
      // useUpdate={({ item, immediate, onDone }) => useCurrencyUpdate({ currency: item, immediate, onDone })}
      // useDelete={useCurrencyDelete}
      searchField={'invoiceNumber'}
      sortOptions={[
        { label: t('common.state'), value: 'state' },
        { label: t('common.issuedAt'), value: 'issuedAt' },
        { label: t('common.invoiceNumber'), value: 'invoiceNumber' },
        { label: t('common.lastUpdate'), value: 'updatedAt' }
      ]}
      noItemButtonText={t('invoices.add')}
      noItemText={t('invoices.noItem')}
      leftTitle={t('menuItems.invoices')}
      // validateAndNormalize={async data => {
      //   if (!isCurrencyFromData(data)) return;
      //   return data;
      // }}
      renderListItem={(item, onEdit, onDelete) => (
        <List
          key={item.id}
          item={item}
          onEdit={(editItem: Invoice) => onEdit(editItem)}
          onDelete={(id: number) => onDelete(id)}
        />
      )}
      // form={({ item, onChange }) => (
      //   <Form
      //     currency={item}
      //     handleChange={d => {
      //       if (isCurrencyFromData(d.currency)) {
      //         onChange({
      //           changedData: d.currency,
      //           isFormValid: d.isFormValid
      //         });
      //       }
      //     }}
      //   />
      // )}
    />
  );
};
