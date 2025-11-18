import { Grid, TextField } from '@mui/material';
import { useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from '../../hooks/useForm';
import type { Client, ClientFromData } from '../../types/client';
import { validators } from '../../utils/validators';

interface Props {
  client?: Client;
  handleChange?: (data: { client: ClientFromData; isFormValid: boolean }) => void;
}
export const Form: FC<Props> = ({ handleChange = () => {}, client }) => {
  const { t } = useTranslation();
  const { form, setForm, update } = useForm<ClientFromData>({
    id: client?.id,
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    name: client?.name ?? '',
    shortName: client?.shortName ?? '',
    code: client?.code ?? '',
    address: client?.address ?? '',
    additional: client?.additional ?? ''
  });
  const [errors, setErrors] = useState({
    email: false,
    phone: false,
    name: false,
    shortName: false
  });

  const validateField = (field: keyof typeof errors, value: string) => {
    if (!validators.required(value) && (field === 'name' || field === 'shortName')) {
      setErrors(e => ({ ...e, [field]: true }));
    } else if (field === 'email') {
      setErrors(e => ({ ...e, email: value !== '' && !validators.email(value) }));
    } else if (field === 'phone') {
      setErrors(e => ({ ...e, phone: value !== '' && !validators.phone(value) }));
    } else {
      setErrors(e => ({ ...e, [field]: false }));
    }
  };

  useEffect(() => {
    setForm({
      id: client?.id,
      email: client?.email ?? '',
      phone: client?.phone ?? '',
      name: client?.name ?? '',
      shortName: client?.shortName ?? '',
      code: client?.code ?? '',
      address: client?.address ?? '',
      additional: client?.additional ?? ''
    });
  }, [client]);

  useEffect(() => {
    const valid =
      form.name.trim() !== '' &&
      form.shortName.trim() !== '' &&
      !errors.email &&
      !errors.phone &&
      !errors.name &&
      !errors.shortName;

    handleChange({
      client: form,
      isFormValid: valid
    });
  }, [form, errors]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label={t('clientsModal.name')}
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
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label={t('clientsModal.shortName')}
          fullWidth
          required
          value={form.shortName}
          error={errors.shortName}
          helperText={errors.shortName ? t('common.fieldRequired') : t('clientsModal.shortNameHelper')}
          onChange={e => {
            update('shortName', e.target.value);
            validateField('shortName', e.target.value);
          }}
          slotProps={{
            htmlInput: {
              maxLength: 2
            }
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label={t('clientsModal.address')}
          fullWidth
          value={form.address}
          onChange={e => update('address', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label={t('clientsModal.code')}
          fullWidth
          value={form.code}
          onChange={e => update('code', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          type="email"
          label={t('clientsModal.email')}
          fullWidth
          value={form.email}
          onChange={e => {
            update('email', e.target.value);
            validateField('email', e.target.value);
          }}
          error={errors.email}
          helperText={errors.email ? t('clientsModal.invalidEmail') : ''}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label={t('clientsModal.phone')}
          fullWidth
          value={form.phone}
          onChange={e => {
            update('phone', e.target.value);
            validateField('phone', e.target.value);
          }}
          error={errors.phone}
          helperText={errors.phone ? t('clientsModal.invalidPhone') : t('clientsModal.phoneHelper')}
          slotProps={{
            htmlInput: {
              maxLength: 16
            }
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 12 }}>
        <TextField
          multiline
          label={t('clientsModal.additional')}
          fullWidth
          rows={5}
          value={form.additional}
          onChange={e => update('additional', e.target.value)}
        />
      </Grid>
    </Grid>
  );
};
