import { Grid, TextField } from '@mui/material';
import { useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from '../../hooks/useForm';
import type { Category, CategoryFromData } from '../../types/category';
import { validators } from '../../utils/validators';

interface Props {
  category?: Category;
  handleChange?: (data: { category: CategoryFromData; isFormValid: boolean }) => void;
}
export const Form: FC<Props> = ({ handleChange = () => {}, category }) => {
  const { t } = useTranslation();
  const { form, setForm, update } = useForm<CategoryFromData>({
    id: category?.id,
    name: category?.name ?? ''
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
      id: category?.id,
      name: category?.name ?? ''
    });
  }, [category]);

  useEffect(() => {
    const valid = form.name.trim() !== '' && !errors.name;

    handleChange({
      category: form,
      isFormValid: valid
    });
  }, [form, errors]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 12 }}>
        <TextField
          label={t('categoriesModal.name')}
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
    </Grid>
  );
};
