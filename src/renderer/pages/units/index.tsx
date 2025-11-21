import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CRUDPage } from '../../components/crudPage/CRUDPage';
import { FilterType } from '../../enums/filterType';
import { useUnitAdd } from '../../hooks/units/useUnitAdd';
import { useUnitAddBatch } from '../../hooks/units/useUnitAddBatch';
import { useUnitDelete } from '../../hooks/units/useUnitDelete';
import { useUnitsRetrieve } from '../../hooks/units/useUnitsRetrieve';
import { useUnitUpdate } from '../../hooks/units/useUnitUpdate';
import type { Rows } from '../../types/excel';
import type { Filter } from '../../types/filter';
import type { Unit, UnitAdd, UnitUpdate } from '../../types/unit';
import { isUnitFromData } from '../../utils/functions';
import { Form } from './Form';
import { List } from './List';

export const UnitsPage: FC = () => {
  const { t } = useTranslation();
  const excelColumns = ['name', 'isArchived'];
  const excelFileName = 'units';
  const excelTemplateData: Rows = [
    {
      name: 'pcs',
      isArchived: false
    },
    {
      name: 'hrs',
      isArchived: false
    }
  ];
  const filters: Filter[] = [
    { label: t('units.filter.allText'), description: undefined, value: FilterType.all },
    {
      label: t('units.filter.activeText'),
      description: t('units.filter.activeDesc'),
      value: FilterType.active,
      initial: true
    },
    {
      label: t('units.filter.archivedText'),
      description: t('units.filter.archivedDesc'),
      value: FilterType.archived
    },
    {
      label: t('units.filter.atleastOneInvoiceText'),
      description: t('units.filter.atleastOneInvoiceDesc'),
      value: FilterType.atleastOneInvoice
    },
    {
      label: t('units.filter.noInvoicesText'),
      description: t('units.filter.noInvoicesDesc'),
      value: FilterType.noInvoices
    },
    {
      label: t('units.filter.noInvoices30Text'),
      description: t('units.filter.noInvoices30Desc'),
      value: FilterType.noInvoices30
    },
    {
      label: t('units.filter.noInvoices60Text'),
      description: t('units.filter.noInvoices60Desc'),
      value: FilterType.noInvoices60
    },
    {
      label: t('units.filter.noInvoices90Text'),
      description: t('units.filter.noInvoices90Desc'),
      value: FilterType.noInvoices90
    }
  ];

  return (
    <CRUDPage<Unit, UnitAdd, UnitUpdate>
      title={t('units.title')}
      filters={filters}
      excelColumns={excelColumns}
      excelFileName={excelFileName}
      excelFormat={'xlsx'}
      excelTemplateData={excelTemplateData}
      useRetrieve={({ filter, onDone }) => {
        const { units, execute } = useUnitsRetrieve({ filter: filter, onDone });
        return { items: units, execute };
      }}
      useAdd={({ item, immediate, onDone }) => useUnitAdd({ unit: item, immediate, onDone })}
      useAddBatch={({ item, immediate, onDone }) => useUnitAddBatch({ units: item, immediate, onDone })}
      useUpdate={({ item, immediate, onDone }) => useUnitUpdate({ unit: item, immediate, onDone })}
      useDelete={useUnitDelete}
      searchField={'name'}
      sortOptions={[
        { label: t('common.name'), value: 'name' },
        { label: t('common.lastUpdate'), value: 'updatedAt' }
      ]}
      noItemButtonText={t('units.add')}
      noItemText={t('units.noItem')}
      leftTitle={t('menuItems.units')}
      validateAndNormalize={async data => {
        if (!isUnitFromData(data)) return;
        return data;
      }}
      renderListItem={(item, onEdit, onDelete) => (
        <List
          key={item.id}
          item={item}
          onEdit={(editItem: Unit) => onEdit(editItem)}
          onDelete={(id: number) => onDelete(id)}
        />
      )}
      form={({ item, onChange }) => (
        <Form
          unit={item}
          handleChange={d => {
            if (isUnitFromData(d.unit)) {
              onChange({
                changedData: d.unit,
                isFormValid: d.isFormValid
              });
            }
          }}
        />
      )}
    />
  );
};
