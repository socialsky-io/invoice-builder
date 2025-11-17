import { useTranslation } from 'react-i18next';
import { CRUDPage } from '../../components/crudPage/CRUDPage';
import { useBusinessAdd } from '../../hooks/business/useBusinessAdd';
import { useBusinessDelete } from '../../hooks/business/useBusinessDelete';
import { useBusinessesRetrieve } from '../../hooks/business/useBusinessesRetrieve';
import { useBusinessUpdate } from '../../hooks/business/useBusinessUpdate';
import { isCRBusinessFromData, toUint8Array } from '../../state/functions';
import type { Business, BusinessAdd, BusinessUpdate } from '../../types/business';
import { Form } from './Form';
import { List } from './List';

export const Businesses = () => {
  const { t } = useTranslation();

  return (
    <CRUDPage
      title={t('menuItems.businesses')}
      useRetrieve={() => {
        const { businesses, execute } = useBusinessesRetrieve({});
        return { items: businesses, execute };
      }}
      useAdd={({ item, immediate, onDone }) => useBusinessAdd({ business: item as BusinessAdd, immediate, onDone })}
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
        if (!isCRBusinessFromData(data)) return;

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
            if (isCRBusinessFromData(d.business)) {
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
