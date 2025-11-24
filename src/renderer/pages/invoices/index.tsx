import { useCallback, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CRUDPage } from '../../shared/components/layout/crudPage/CRUDPage';
import { FilterType } from '../../shared/enums/filterType';
import { InvoiceStatus } from '../../shared/enums/invoiceStatus';
import { useInvoicesRetrieve } from '../../shared/hooks/invoices/useInvoicesRetrieve';
import type { Row } from '../../shared/types/excel';
import type { Filter, FilterData } from '../../shared/types/filter';
import type { Invoice, InvoiceAdd, InvoiceUpdate } from '../../shared/types/invoice';
import type { Response } from '../../shared/types/response';
import { exportExcel } from '../../shared/utils/fileFunctions';
import { createCommonFilters } from '../../shared/utils/filterSortFunctions';
import { useAppSelector } from '../../state/configureStore';
import { selectBusinessesSnapshotsOptions, selectClientsSnapshotsOptions } from '../../state/pageSlice';
import { List } from './List';

export const InvoicesPage: FC = () => {
  const { t } = useTranslation();
  const clientsOptions = useAppSelector(selectClientsSnapshotsOptions);
  const businessesOptions = useAppSelector(selectBusinessesSnapshotsOptions);
  const filters: Filter[] = [
    ...createCommonFilters({ t, namespace: 'invoices', initial: FilterType.active, shouldCloseOnClick: false }),
    {
      label: t('common.client'),
      type: FilterType.client,
      options: clientsOptions
    },
    {
      label: t('menuItems.businesses'),
      type: FilterType.business,
      options: businessesOptions
    },
    {
      label: t('invoices.filter.date'),
      type: FilterType.date
    },
    {
      type: FilterType.status,
      label: t('currencies.status'),
      value: FilterType.status,
      options: [
        { label: InvoiceStatus.unpaid, value: InvoiceStatus.unpaid },
        { label: InvoiceStatus.partiallyPaid, value: InvoiceStatus.partiallyPaid },
        { label: InvoiceStatus.paid, value: InvoiceStatus.paid },
        { label: InvoiceStatus.closed, value: InvoiceStatus.closed }
      ]
    }
  ];
  const useInvoicesCRUDRetrieve = (args: { filter?: FilterData[]; onDone?: (data: Response<Invoice[]>) => void }) => {
    const { invoices, execute } = useInvoicesRetrieve({ filter: args.filter, onDone: args.onDone });
    return { items: invoices, execute };
  };
  const exportInvoices = useCallback(async (invoices: Invoice[]) => {
    const mapPayment = (inv: Invoice) => (inv.invoicePayments ?? []).map(p => p);
    const mapItem = (inv: Invoice) => (inv.invoiceItems ?? []).map(it => it);
    const toRow = (obj: unknown): Row => Object.fromEntries(Object.entries(obj as Record<string, unknown>)) as Row;

    const cleanInvoice = (invoice: Invoice) => {
      const { invoicePayments, invoiceItems, currencyFormat, businessLogoSnapshot, ...rest } = invoice;

      void invoicePayments;
      void invoiceItems;
      void currencyFormat;
      void businessLogoSnapshot;

      return rest;
    };

    const invoicesData = invoices;
    const invoicesSheet = invoicesData.map(cleanInvoice);
    const itemsSheet = invoicesData.flatMap(mapItem);
    const paymentsSheet = invoicesData.flatMap(mapPayment);

    await exportExcel(
      [
        { name: 'Invoices', rows: invoicesSheet.map(toRow) },
        { name: 'Payments', rows: paymentsSheet.map(toRow) },
        { name: 'Items', rows: itemsSheet.map(toRow) }
      ],
      'invoices.xlsx'
    );
  }, []);

  return (
    <CRUDPage<Invoice, InvoiceAdd, InvoiceUpdate>
      title={t('common.invoice')}
      filters={filters}
      showOnlyExport={true}
      useRetrieve={useInvoicesCRUDRetrieve}
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
      exportExcelHandler={exportInvoices}
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
