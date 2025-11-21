import { FormControlLabel, Grid, Switch, TextField } from '@mui/material';
import { useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from '../../shared/hooks/useForm';
import type { Unit, UnitFromData } from '../../shared/types/unit';
import { validators } from '../../shared/utils/validators';

interface Props {
  unit?: Unit;
  handleChange?: (data: { unit: UnitFromData; isFormValid: boolean }) => void;
}
export const Form: FC<Props> = ({ handleChange = () => {}, unit }) => {
  const { t } = useTranslation();
  const { form, setForm, update } = useForm<UnitFromData>({
    id: unit?.id,
    name: unit?.name ?? '',
    isArchived: unit?.isArchived ?? false
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
      id: unit?.id,
      name: unit?.name ?? '',
      isArchived: unit?.isArchived ?? false
    });
  }, [unit]);

  useEffect(() => {
    const valid = form.name.trim() !== '' && !errors.name;

    handleChange({
      unit: form,
      isFormValid: valid
    });
  }, [form, errors]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 12 }}>
        <TextField
          label={t('unitsModal.name')}
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
      <Grid size={{ xs: 12, md: 12 }}>
        <FormControlLabel
          control={<Switch checked={form.isArchived} onChange={e => update('isArchived', e.target.checked)} />}
          label={t('unitsModal.isArchived')}
        />
      </Grid>
    </Grid>
  );
};
