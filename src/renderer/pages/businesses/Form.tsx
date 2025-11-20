import { Grid, TextField } from '@mui/material';
import { useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadImage } from '../../components/uploadImage/UploadImage';
import { useForm } from '../../hooks/useForm';
import type { Business, BusinessFromData } from '../../types/business';
import { fromUint8Array, toUint8Array } from '../../utils/functions';
import { validators } from '../../utils/validators';

interface Props {
  business?: Business;
  handleChange?: (data: { business: BusinessFromData; isFormValid: boolean }) => void;
}
export const Form: FC<Props> = ({ handleChange = () => {}, business }) => {
  const { t } = useTranslation();
  const { form, setForm, update } = useForm<BusinessFromData>({
    id: business?.id,
    logo: undefined,
    email: business?.email ?? '',
    phone: business?.phone ?? '',
    name: business?.name ?? '',
    shortName: business?.shortName ?? '',
    role: business?.role ?? '',
    address: business?.address ?? '',
    website: business?.website ?? '',
    additional: business?.additional ?? '',
    paymentInformation: business?.paymentInformation ?? '',
    fileSize: business?.fileSize,
    fileType: business?.fileType
  });
  const [errors, setErrors] = useState({
    email: false,
    phone: false,
    name: false,
    shortName: false
  });
  const [logoUrl, setLogoUrl] = useState<string | undefined>(fromUint8Array(business?.logo) ?? undefined);

  const onUpload = async (file?: Blob) => {
    if (file) {
      const fileUnitArray = await toUint8Array(t, file);
      if (fileUnitArray)
        setForm(prev => ({
          ...prev,
          logo: fileUnitArray,
          fileSize: file.size,
          fileType: file.type
        }));
    } else {
      setForm(prev => ({ ...prev, logo: undefined, fileSize: undefined, fileType: undefined }));
    }
  };

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
      id: business?.id,
      logo: undefined,
      email: business?.email ?? '',
      phone: business?.phone ?? '',
      name: business?.name ?? '',
      shortName: business?.shortName ?? '',
      role: business?.role ?? '',
      address: business?.address ?? '',
      website: business?.website ?? '',
      additional: business?.additional ?? '',
      paymentInformation: business?.paymentInformation ?? ''
    });

    setLogoUrl(fromUint8Array(business?.logo) ?? undefined);
  }, [business]);

  useEffect(() => {
    const valid =
      form.name.trim() !== '' &&
      form.shortName.trim() !== '' &&
      !errors.email &&
      !errors.phone &&
      !errors.name &&
      !errors.shortName;

    handleChange({
      business: form,
      isFormValid: valid
    });
  }, [form, errors]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
        <UploadImage onUpload={onUpload} logoUrl={logoUrl} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label={t('businessesModal.name')}
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
          label={t('businessesModal.shortName')}
          fullWidth
          required
          value={form.shortName}
          error={errors.shortName}
          helperText={errors.shortName ? t('common.fieldRequired') : t('businessesModal.shortNameHelper')}
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
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label={t('businessesModal.address')}
          fullWidth
          value={form.address}
          onChange={e => update('address', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label={t('businessesModal.role')}
          fullWidth
          value={form.role}
          onChange={e => update('role', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          type="email"
          label={t('businessesModal.email')}
          fullWidth
          value={form.email}
          onChange={e => {
            update('email', e.target.value);
            validateField('email', e.target.value);
          }}
          error={errors.email}
          helperText={errors.email ? t('businessesModal.invalidEmail') : ''}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label={t('businessesModal.phone')}
          fullWidth
          value={form.phone}
          onChange={e => {
            update('phone', e.target.value);
            validateField('phone', e.target.value);
          }}
          error={errors.phone}
          helperText={errors.phone ? t('businessesModal.invalidPhone') : t('businessesModal.phoneHelper')}
          slotProps={{
            htmlInput: {
              maxLength: 16
            }
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label={t('businessesModal.website')}
          fullWidth
          value={form.website}
          onChange={e => update('website', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          multiline
          label={t('businessesModal.additional')}
          fullWidth
          rows={5}
          value={form.additional}
          onChange={e => update('additional', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 12 }}>
        <TextField
          multiline
          rows={5}
          label={t('businessesModal.paymentInfo')}
          fullWidth
          value={form.paymentInformation}
          onChange={e => update('paymentInformation', e.target.value)}
        />
      </Grid>
    </Grid>
  );
};
