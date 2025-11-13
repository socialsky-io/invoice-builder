import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  AppBar,
  Button,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadImage } from '../../components/uploadImage/UploadImage';
import { fromUint8Array } from '../../state/functions';
import type { Business } from '../../types/business';

interface Props {
  business?: Business;
  isOpen: boolean;
  handleClose?: () => void;
  handleSave?: (data: {
    id?: number;
    logo?: Blob;
    email?: string;
    phone?: string;
    name: string;
    shortName: string;
    role?: string;
    address?: string;
    website?: string;
    additional?: string;
    paymentInformation?: string;
  }) => void;
}
export const CRBusinessModal: FC<Props> = ({ isOpen, handleClose = () => {}, handleSave = () => {}, business }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [errorEmail, setErrorEmail] = useState(false);
  const [errorPhone, setErrorPhone] = useState(false);
  const [errorName, setErrorName] = useState(false);
  const [errorShortName, setErrorShortName] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const [logoUrl] = useState<string | undefined>(fromUint8Array(business?.logo) ?? undefined);
  const [logo, setLogo] = useState<Blob | undefined>(undefined);
  const [email, setEmail] = useState<string>(business?.email ?? '');
  const [phone, setPhone] = useState<string>(business?.phone ?? '');
  const [name, setName] = useState<string>(business?.name ?? '');
  const [shortName, setShortName] = useState<string>(business?.shortName ?? '');
  const [role, setRole] = useState<string>(business?.role ?? '');
  const [address, setAddress] = useState<string>(business?.address ?? '');
  const [website, setWebsite] = useState<string>(business?.website ?? '');
  const [additional, setAdditional] = useState<string>(business?.additional ?? '');
  const [paymentInformation, setPaymentInformation] = useState<string>(business?.paymentInformation ?? '');

  const onUpload = (file: Blob) => {
    setLogo(file);
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

  const handleInputChange =
    (setter: (val: string) => void, key: keyof typeof validators) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      setter(value);

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
    setIsFormValid(
      name.trim() !== '' && shortName.trim() !== '' && !errorEmail && !errorPhone && !errorName && !errorShortName
    );
  }, [name, shortName, errorEmail, errorPhone, errorShortName, errorName]);

  return (
    <Dialog fullScreen open={isOpen} onClose={handleClose}>
      <AppBar sx={{ position: 'relative', borderRadius: '0' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Tooltip title={t('ariaLabel.back')}>
            <IconButton
              onClick={handleClose}
              aria-label={t('ariaLabel.back')}
              sx={{
                color: theme.palette.secondary.main
              }}
            >
              <ArrowBackIcon fontSize="medium" />
            </IconButton>
          </Tooltip>

          <Typography variant="h5" component="div">
            {t('businessesCRModal.title')}
          </Typography>

          <Button
            autoFocus
            color="inherit"
            onClick={() => {
              handleSave({
                id: business?.id,
                logo,
                email,
                phone,
                name,
                shortName,
                role,
                address,
                website,
                additional,
                paymentInformation
              });
            }}
            disabled={!isFormValid}
          >
            {t('common.save')}
          </Button>
        </Toolbar>
      </AppBar>

      <DialogContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <UploadImage onUpload={onUpload} logoUrl={logoUrl} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label={t('businessesCRModal.name')}
              fullWidth
              required
              value={name}
              error={errorName}
              helperText={errorName ? t('common.fieldRequired') : ''}
              onChange={handleInputChange(setName, 'name')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label={t('businessesCRModal.shortName')}
              fullWidth
              required
              value={shortName}
              error={errorShortName}
              helperText={errorShortName ? t('common.fieldRequired') : t('businessesCRModal.shortNameHelper')}
              onChange={handleInputChange(setShortName, 'shortName')}
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
              value={address}
              onChange={handleInputChange(setAddress, 'address')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label={t('businessesCRModal.role')}
              fullWidth
              value={role}
              onChange={handleInputChange(setRole, 'role')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              type="email"
              label={t('businessesCRModal.email')}
              fullWidth
              value={email}
              onChange={handleInputChange(setEmail, 'email')}
              error={errorEmail}
              helperText={errorEmail ? t('businessesCRModal.invalidEmail') : ''}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label={t('businessesCRModal.phone')}
              fullWidth
              value={phone}
              onChange={handleInputChange(setPhone, 'phone')}
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
              value={website}
              onChange={handleInputChange(setWebsite, 'website')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label={t('businessesCRModal.additional')}
              fullWidth
              value={additional}
              onChange={handleInputChange(setAdditional, 'additional')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 12 }}>
            <TextField
              multiline
              rows={5}
              label={t('businessesCRModal.paymentInfo')}
              fullWidth
              value={paymentInformation}
              onChange={handleInputChange(setPaymentInformation, 'paymentInformation')}
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
