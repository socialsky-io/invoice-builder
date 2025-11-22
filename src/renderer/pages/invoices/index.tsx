import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { InvoiceStatus } from '../../shared/enums/invoiceStatus';
import { useInvoicesRetrieve } from '../../shared/hooks/invoices/useInvoicesRetrieve';

import { CRUDPage } from '../../shared/components/crudPage/CRUDPage';
import { FilterType } from '../../shared/enums/filterType';
import type { Filter } from '../../shared/types/filter';
import type { Invoice, InvoiceAdd, InvoiceUpdate } from '../../shared/types/invoice';
import { useAppSelector } from '../../state/configureStore';
import { selectBusinessesSnapshotsOptions, selectClientsSnapshotsOptions } from '../../state/pageSlice';
import { List } from './List';

export const InvoicesPage: FC = () => {
  const { t } = useTranslation();
  const clientsOptions = useAppSelector(selectClientsSnapshotsOptions);
  const businessesOptions = useAppSelector(selectBusinessesSnapshotsOptions);

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
  const filters: Filter[] = [
    {
      label: t('invoices.filter.allText'),
      description: undefined,
      value: FilterType.all,
      type: FilterType.all,
      isGroup: true
    },
    {
      label: t('invoices.filter.activeText'),
      description: t('invoices.filter.activeDesc'),
      value: FilterType.active,
      type: FilterType.active,
      initial: true,
      isGroup: true
    },
    {
      label: t('invoices.filter.archivedText'),
      description: t('invoices.filter.archivedDesc'),
      value: FilterType.archived,
      type: FilterType.archived,
      isGroup: true
    },
    {
      label: t('invoices.filter.client'),
      type: FilterType.client,
      options: clientsOptions
    },
    {
      label: t('invoices.filter.business'),
      type: FilterType.business,
      options: businessesOptions
    },
    {
      label: t('invoices.filter.date'),
      type: FilterType.date
    },
    {
      type: FilterType.status,
      label: t('invoices.filter.status'),
      value: FilterType.status,
      options: [
        { label: InvoiceStatus.unpaid, value: InvoiceStatus.unpaid },
        { label: InvoiceStatus.partiallyPaid, value: InvoiceStatus.partiallyPaid },
        { label: InvoiceStatus.paid, value: InvoiceStatus.paid },
        { label: InvoiceStatus.closed, value: InvoiceStatus.closed }
      ]
    }
  ];

  return (
    <CRUDPage<Invoice, InvoiceAdd, InvoiceUpdate>
      title={t('invoices.title')}
      filters={filters}
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
        { label: t('common.status'), value: 'status' },
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
      renderListItem={(item, selectedItem, onEdit) => (
        <List key={item.id} item={item} selectedItem={selectedItem} onEdit={(editItem: Invoice) => onEdit(editItem)} />
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
