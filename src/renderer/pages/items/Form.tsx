import { Autocomplete, Grid, TextField } from '@mui/material';
import { useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../../main/types/category';
import { AmountInput } from '../../components/amountInput/AmountInput';
import { useCategoriesRetrieve } from '../../hooks/categories/useCategoriesRetrieve';
import { useUnitsRetrieve } from '../../hooks/units/useUnitsRetrieve';
import { useForm } from '../../hooks/useForm';
import { useAppDispatch, useAppSelector } from '../../state/configureStore';
import { addToast, selectCategoriesOptions, selectSettings, selectUnitsOptions } from '../../state/pageSlice';
import type { Item, ItemFromData } from '../../types/item';
import type { Response } from '../../types/response';
import type { Unit } from '../../types/unit';
import { validators } from '../../utils/validators';

interface Props {
  item?: Item;
  handleChange?: (data: { item: ItemFromData; isFormValid: boolean }) => void;
}
export const Form: FC<Props> = ({ handleChange = () => {}, item }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  useUnitsRetrieve({
    onDone: (data: Response<Unit[]>) => {
      if (!data.success) {
        if (data.message) dispatch(addToast({ message: data.message, severity: 'error' }));
        else if (data.key) dispatch(addToast({ message: t(data.key), severity: 'error' }));
      }
    }
  });

  useCategoriesRetrieve({
    onDone: (data: Response<Category[]>) => {
      if (!data.success) {
        if (data.message) dispatch(addToast({ message: data.message, severity: 'error' }));
        else if (data.key) dispatch(addToast({ message: t(data.key), severity: 'error' }));
      }
    }
  });

  const settings = useAppSelector(selectSettings);
  const unitsOptions = useAppSelector(selectUnitsOptions);
  const categoriesOptions = useAppSelector(selectCategoriesOptions);

  const { form, setForm, update } = useForm<ItemFromData>({
    id: item?.id,
    name: item?.name ?? '',
    amountCents: item?.amountCents,
    amount: item?.amountCents ? item.amountCents / 100 : 0,
    unitId: item?.unitId,
    categoryId: item?.categoryId,
    description: item?.description ?? ''
  });

  const [errors, setErrors] = useState({
    name: false
  });

  const validateField = (field: keyof typeof errors, value: string) => {
    if (!validators.required(value) && field === 'name') {
      setErrors(e => ({ ...e, [field]: true }));
    } else {
      setErrors(e => ({ ...e, [field]: false }));
    }
  };

  useEffect(() => {
    setForm({
      id: item?.id,
      name: item?.name ?? '',
      amountCents: item?.amountCents,
      amount: item?.amountCents ? item.amountCents / 100 : 0,
      unitId: item?.unitId,
      categoryId: item?.categoryId,
      description: item?.description ?? ''
    });
  }, [item]);

  useEffect(() => {
    const valid = form.name.trim() !== '';

    handleChange({
      item: {
        id: form.id,
        name: form.name,
        amount: form.amount,
        amountCents: form.amount ? form.amount * 100 : 0,
        unitId: form.unitId,
        categoryId: form.categoryId,
        description: form.description
      },
      isFormValid: valid
    });
  }, [form, errors]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label={t('itemsModal.name')}
          fullWidth
          required
          value={form.name}
          error={errors.name}
          helperText={errors.name ? t('common.fieldRequired') : ''}
          onChange={e => {
            update('name', e.target.value);
            validateField('name', e.target.value);
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label={t('itemsModal.description')}
          fullWidth
          value={form.description}
          onChange={e => {
            update('description', e.target.value);
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AmountInput
          required={true}
          label={t('itemsModal.amount')}
          value={form.amount ?? 0}
          amountFormat={settings?.amountFormat}
          onChange={e => {
            update('amount', e);
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Autocomplete
          fullWidth
          options={unitsOptions}
          disableClearable={false}
          value={unitsOptions.find(opt => opt.value === form.unitId) ?? null}
          onChange={(_e, newValue) => {
            update('unitId', newValue?.value);
          }}
          renderInput={params => <TextField {...params} label={t('itemsModal.unit')} />}
          freeSolo={false}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Autocomplete
          fullWidth
          options={categoriesOptions}
          disableClearable={false}
          value={categoriesOptions.find(opt => opt.value === form.categoryId) ?? null}
          onChange={(_e, newValue) => {
            update('categoryId', newValue?.value);
          }}
          renderInput={params => <TextField {...params} label={t('itemsModal.category')} />}
          freeSolo={false}
        />
      </Grid>
    </Grid>
  );
};
