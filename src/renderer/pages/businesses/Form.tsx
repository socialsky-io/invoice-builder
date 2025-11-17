import { Grid, TextField } from '@mui/material';
import { useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadImage } from '../../components/uploadImage/UploadImage';
import { fromUint8Array } from '../../state/functions';
import type { Business, BusinessFromData } from '../../types/business';

interface Props {
  business?: Business;
  handleChange?: (data: { business: BusinessFromData; isFormValid: boolean }) => void;
}
export const Form: FC<Props> = ({ handleChange = () => {}, business }) => {
  const { t } = useTranslation();
  const [errorEmail, setErrorEmail] = useState(false);
  const [errorPhone, setErrorPhone] = useState(false);
  const [errorName, setErrorName] = useState(false);
  const [errorShortName, setErrorShortName] = useState(false);

  const [form, setForm] = useState<BusinessFromData>({
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
  const [logoUrl, setLogoUrl] = useState<string | undefined>(fromUint8Array(business?.logo) ?? undefined);

  const updateField = (key: keyof BusinessFromData, value: string | Blob | undefined) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const onUpload = (file: Blob) => {
    updateField('logo', file);
  };

  const validators: Record<
    'email' | 'phone' | 'name' | 'shortName' | 'role' | 'address' | 'website' | 'additional' | 'paymentInformation',
    ((val: string) => boolean) | undefined
  > = {
    email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    phone: value => /^\+[1-9]\d{6,14}$/.test(value),
    name: value => value.trim() !== '',
    shortName: value => value.trim() !== '',
    role: undefined,
    address: undefined,
    website: undefined,
    additional: undefined,
    paymentInformation: undefined
  };

  const handleInputChange = (key: keyof typeof validators) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    updateField(key, value);

    const validate = validators[key];
    if (!validate) return;

    const isValid = validate(value);

    switch (key) {
      case 'email':
        setErrorEmail(value !== '' && !isValid);
        break;
      case 'phone':
        setErrorPhone(value !== '' && !isValid);
        break;
      case 'name':
        setErrorName(!isValid);
        break;
      case 'shortName':
        setErrorShortName(!isValid);
        break;
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
      !errorEmail &&
      !errorPhone &&
      !errorName &&
      !errorShortName;

    handleChange({
      business: form,
      isFormValid: valid
    });
  }, [form, errorEmail, errorPhone, errorName, errorShortName]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
        <UploadImage onUpload={onUpload} logoUrl={logoUrl} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label={t('businessesCRModal.name')}
          fullWidth
          required
          value={form.name}
          error={errorName}
          helperText={errorName ? t('common.fieldRequired') : ''}
          onChange={handleInputChange('name')}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label={t('businessesCRModal.shortName')}
          fullWidth
          required
          value={form.shortName}
          error={errorShortName}
          helperText={errorShortName ? t('common.fieldRequired') : t('businessesCRModal.shortNameHelper')}
          onChange={handleInputChange('shortName')}
          slotProps={{
            htmlInput: {
              maxLength: 2
            }
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label={t('businessesCRModal.address')}
          fullWidth
          value={form.address}
          onChange={handleInputChange('address')}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label={t('businessesCRModal.role')}
          fullWidth
          value={form.role}
          onChange={handleInputChange('role')}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          type="email"
          label={t('businessesCRModal.email')}
          fullWidth
          value={form.email}
          onChange={handleInputChange('email')}
          error={errorEmail}
          helperText={errorEmail ? t('businessesCRModal.invalidEmail') : ''}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label={t('businessesCRModal.phone')}
          fullWidth
          value={form.phone}
          onChange={handleInputChange('phone')}
          error={errorPhone}
          helperText={errorPhone ? t('businessesCRModal.invalidPhone') : t('businessesCRModal.phoneHelper')}
          slotProps={{
            htmlInput: {
              maxLength: 16
            }
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label={t('businessesCRModal.website')}
          fullWidth
          value={form.website}
          onChange={handleInputChange('website')}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          multiline
          label={t('businessesCRModal.additional')}
          fullWidth
          rows={5}
          value={form.additional}
          onChange={handleInputChange('additional')}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 12 }}>
        <TextField
          multiline
          rows={5}
          label={t('businessesCRModal.paymentInfo')}
          fullWidth
          value={form.paymentInformation}
          onChange={handleInputChange('paymentInformation')}
        />
      </Grid>
    </Grid>
  );
};
