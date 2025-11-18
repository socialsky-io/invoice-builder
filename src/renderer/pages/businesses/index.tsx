import { useTranslation } from 'react-i18next';
import { CRUDPage } from '../../components/crudPage/CRUDPage';
import { FilterType } from '../../enums/filterType';
import { useBusinessAdd } from '../../hooks/business/useBusinessAdd';
import { useBusinessAddBatch } from '../../hooks/business/useBusinessAddBatch';
import { useBusinessDelete } from '../../hooks/business/useBusinessDelete';
import { useBusinessesRetrieve } from '../../hooks/business/useBusinessesRetrieve';
import { useBusinessUpdate } from '../../hooks/business/useBusinessUpdate';
import type { Business, BusinessAdd, BusinessUpdate } from '../../types/business';
import type { Rows } from '../../types/excel';
import type { Filter } from '../../types/filter';
import { dataUrlToUint8Array, isBusinessFromData, toUint8Array } from '../../utils/functions';
import { Form } from './Form';
import { List } from './List';

export const BusinessesPage = () => {
  const { t } = useTranslation();
  const excelColumns = [
    'name',
    'shortName',
    'address',
    'role',
    'email',
    'phone',
    'website',
    'additional',
    'paymentInformation',
    'logo'
  ];
  const excelFileName = 'businesses';
  const excelTemplateData: Rows = [
    {
      name: 'Acme Corp',
      shortName: 'AC',
      address: '123 Main St',
      role: 'Manager',
      email: 'acme@example.com',
      phone: '555-1234',
      website: 'https://acme.com',
      additional: 'AC',
      paymentInformation:
        '`Cardholder Name: John Doe; Card Type: Visa; Card Number: 4111 1111 1111 1111; Expiration Date: 12/2026; CVV: 123; Billing Address: 123 Main Street, Apt 4B, Springfield, IL 62704; Payment Method: Credit Card; Transaction ID: TXN1234567890; Payment Status: Completed; Amount Paid: $250.00 USD; Currency: USD; Payment Date: 2025-11-17`',
      logo: dataUrlToUint8Array(
        'data:image/png;base64,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'
      )
    },
    {
      name: 'Beta Industries',
      shortName: 'BI',
      address: '456 Second Ave',
      email: 'beta@example.com',
      phone: '555-5678',
      website: 'https://beta.com',
      additional: 'BI'
    }
  ];
  const filters: Filter[] = [
    { label: t('businesses.filter.allText'), description: undefined, value: FilterType.all, initial: true },
    {
      label: t('businesses.filter.atleastOneInvoiceText'),
      description: t('businesses.filter.atleastOneInvoiceDesc'),
      value: FilterType.atleastOneInvoice
    },
    {
      label: t('businesses.filter.noInvoicesText'),
      description: t('businesses.filter.noInvoicesDesc'),
      value: FilterType.noInvoices
    },
    {
      label: t('businesses.filter.noInvoices30Text'),
      description: t('businesses.filter.noInvoices30Desc'),
      value: FilterType.noInvoices30
    },
    {
      label: t('businesses.filter.noInvoices60Text'),
      description: t('businesses.filter.noInvoices60Desc'),
      value: FilterType.noInvoices60
    },
    {
      label: t('businesses.filter.noInvoices90Text'),
      description: t('businesses.filter.noInvoices90Desc'),
      value: FilterType.noInvoices90
    }
  ];

  return (
    <CRUDPage
      title={t('menuItems.businesses')}
      filters={filters}
      excelColumns={excelColumns}
      excelFileName={excelFileName}
      excelFormat={'xlsx'}
      excelTemplateData={excelTemplateData}
      useRetrieve={({ filter }) => {
        const { businesses, execute } = useBusinessesRetrieve({ filter: filter });
        return { items: businesses, execute };
      }}
      useAdd={({ item, immediate, onDone }) => useBusinessAdd({ business: item as BusinessAdd, immediate, onDone })}
      useAddBatch={({ item, immediate, onDone }) =>
        useBusinessAddBatch({ businesses: item as BusinessAdd[], immediate, onDone })
      }
      useUpdate={({ item, immediate, onDone }) =>
        useBusinessUpdate({ business: item as BusinessUpdate, immediate, onDone })
      }
      useDelete={useBusinessDelete}
      searchField={'name'}
      sortOptions={[
        { label: t('common.name'), value: 'name' },
        { label: t('common.lastUpdate'), value: 'updatedAt' }
      ]}
      noItemButtonText={t('businesses.add')}
      noItemText={t('businesses.noItem')}
      leftTitle={t('menuItems.businesses')}
      validateAndNormalize={async data => {
        if (!isBusinessFromData(data)) return;

        let logo = undefined;
        if (data.logo) logo = await toUint8Array(data.logo);

        return { ...data, logo };
      }}
      renderListItem={(item, onEdit, onDelete) => (
        <List
          key={item.id}
          item={item}
          onEdit={(editItem: Business) => onEdit(editItem)}
          onDelete={(id: number) => onDelete(id)}
        />
      )}
      form={({ item, onChange }) => (
        <Form
          business={item}
          handleChange={d => {
            if (isBusinessFromData(d.business)) {
              onChange({
                changedData: d.business,
                isFormValid: d.isFormValid
              });
            }
          }}
        />
      )}
    />
  );
};
