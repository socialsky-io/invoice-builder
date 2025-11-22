import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CRUDPage } from '../../shared/components/crudPage/CRUDPage';
import { FilterType } from '../../shared/enums/filterType';
import { useUnitAdd } from '../../shared/hooks/units/useUnitAdd';
import { useUnitAddBatch } from '../../shared/hooks/units/useUnitAddBatch';
import { useUnitDelete } from '../../shared/hooks/units/useUnitDelete';
import { useUnitsRetrieve } from '../../shared/hooks/units/useUnitsRetrieve';
import { useUnitUpdate } from '../../shared/hooks/units/useUnitUpdate';
import type { Rows } from '../../shared/types/excel';
import type { Filter } from '../../shared/types/filter';
import type { Unit, UnitAdd, UnitUpdate } from '../../shared/types/unit';
import { isUnitFromData } from '../../shared/utils/functions';
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
    {
      label: t('items.filter.allText'),
      description: undefined,
      value: FilterType.all,
      type: FilterType.all,
      isGroup: true
    },
    {
      label: t('items.filter.activeText'),
      description: t('items.filter.activeDesc'),
      value: FilterType.active,
      initial: true,
      type: FilterType.active,
      isGroup: true
    },
    {
      label: t('units.filter.archivedText'),
      description: t('units.filter.archivedDesc'),
      value: FilterType.archived,
      type: FilterType.archived,
      isGroup: true
    },
    {
      label: t('units.filter.atleastOneInvoiceText'),
      description: t('units.filter.atleastOneInvoiceDesc'),
      value: FilterType.atleastOneInvoice,
      type: FilterType.atleastOneInvoice,
      isGroup: true
    },
    {
      label: t('units.filter.noInvoicesText'),
      description: t('units.filter.noInvoicesDesc'),
      value: FilterType.noInvoices,
      type: FilterType.noInvoices,
      isGroup: true
    },
    {
      label: t('units.filter.noInvoices30Text'),
      description: t('units.filter.noInvoices30Desc'),
      value: FilterType.noInvoices30,
      type: FilterType.noInvoices30,
      isGroup: true
    },
    {
      label: t('units.filter.noInvoices60Text'),
      description: t('units.filter.noInvoices60Desc'),
      value: FilterType.noInvoices60,
      type: FilterType.noInvoices60,
      isGroup: true
    },
    {
      label: t('units.filter.noInvoices90Text'),
      description: t('units.filter.noInvoices90Desc'),
      value: FilterType.noInvoices90,
      type: FilterType.noInvoices90,
      isGroup: true
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
      renderListItem={(item, selectedItem, onEdit, onDelete) => (
        <List
          key={item.id}
          item={item}
          selectedItem={selectedItem}
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
