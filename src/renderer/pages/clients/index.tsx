import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CRUDPage } from '../../components/crudPage/CRUDPage';
import { FilterType } from '../../enums/filterType';
import { useClientAdd } from '../../hooks/clients/useClientAdd';
import { useClientAddBatch } from '../../hooks/clients/useClientAddBatch';
import { useClientDelete } from '../../hooks/clients/useClientDelete';
import { useClientsRetrieve } from '../../hooks/clients/useClientsRetrieve';
import { useClientUpdate } from '../../hooks/clients/useClientUpdate';
import type { Client, ClientAdd, ClientUpdate } from '../../types/client';
import type { Rows } from '../../types/excel';
import type { Filter } from '../../types/filter';
import { isClientFromData } from '../../utils/functions';
import { Form } from './Form';
import { List } from './List';

export const ClientsPage: FC = () => {
  const { t } = useTranslation();
  const excelColumns = ['name', 'shortName', 'address', 'email', 'phone', 'code', 'additional'];
  const excelFileName = 'clients';
  const excelTemplateData: Rows = [
    {
      name: 'John Doe',
      shortName: 'JD',
      address: '123 Main St, Springfield',
      email: 'john.doe@email.com',
      phone: '+1-555-1234',
      code: 'A001',
      additional: 'VAT DE123456789'
    },
    {
      name: 'Jane Smith',
      shortName: 'JS',
      address: '456 Elm St, Shelbyville',
      email: 'jane.smith@email.com',
      phone: '+1-555-5678',
      code: 'B002'
    }
  ];
  const filters: Filter[] = [
    { label: t('clients.filter.allText'), description: undefined, value: FilterType.all, initial: true },
    {
      label: t('clients.filter.atleastOneInvoiceText'),
      description: t('clients.filter.atleastOneInvoiceDesc'),
      value: FilterType.atleastOneInvoice
    },
    {
      label: t('clients.filter.noInvoicesText'),
      description: t('clients.filter.noInvoicesDesc'),
      value: FilterType.noInvoices
    },
    {
      label: t('clients.filter.noInvoices30Text'),
      description: t('clients.filter.noInvoices30Desc'),
      value: FilterType.noInvoices30
    },
    {
      label: t('clients.filter.noInvoices60Text'),
      description: t('clients.filter.noInvoices60Desc'),
      value: FilterType.noInvoices60
    },
    {
      label: t('clients.filter.noInvoices90Text'),
      description: t('clients.filter.noInvoices90Desc'),
      value: FilterType.noInvoices90
    }
  ];

  return (
    <CRUDPage
      title={t('menuItems.clients')}
      filters={filters}
      excelColumns={excelColumns}
      excelFileName={excelFileName}
      excelFormat={'xlsx'}
      excelTemplateData={excelTemplateData}
      useRetrieve={({ filter }) => {
        const { clients, execute } = useClientsRetrieve({ filter: filter });
        return { items: clients, execute };
      }}
      useAdd={({ item, immediate, onDone }) => useClientAdd({ client: item as ClientAdd, immediate, onDone })}
      useAddBatch={({ item, immediate, onDone }) =>
        useClientAddBatch({ clients: item as ClientAdd[], immediate, onDone })
      }
      useUpdate={({ item, immediate, onDone }) => useClientUpdate({ client: item as ClientUpdate, immediate, onDone })}
      useDelete={useClientDelete}
      searchField={'name'}
      sortOptions={[
        { label: t('common.name'), value: 'name' },
        { label: t('common.lastUpdate'), value: 'updatedAt' }
      ]}
      noItemButtonText={t('clients.add')}
      noItemText={t('clients.noItem')}
      leftTitle={t('menuItems.clients')}
      validateAndNormalize={data => {
        return data;
      }}
      renderListItem={(item, onEdit, onDelete) => (
        <List
          key={item.id}
          item={item}
          onEdit={(editItem: Client) => onEdit(editItem)}
          onDelete={(id: number) => onDelete(id)}
        />
      )}
      form={({ item, onChange }) => (
        <Form
          client={item}
          handleChange={d => {
            if (isClientFromData(d.client)) {
              onChange({
                changedData: d.client,
                isFormValid: d.isFormValid
              });
            }
          }}
        />
      )}
    />
  );
};
