import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AppBar, Button, IconButton, Toolbar, Tooltip, Typography, useTheme } from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
  formData?: unknown;
  isFormValid: boolean;
  onClose?: () => void;
  onSave?: (data: unknown) => void;
}
export const ModalAppBar: FC<Props> = ({ title, formData, isFormValid, onClose = () => {}, onSave = () => {} }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <AppBar sx={{ position: 'relative', borderRadius: '0' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Tooltip title={t('ariaLabel.back')}>
          <IconButton
            onClick={onClose}
            aria-label={t('ariaLabel.back')}
            sx={{
              color: theme.palette.secondary.main
            }}
          >
            <ArrowBackIcon fontSize="medium" />
          </IconButton>
        </Tooltip>

        <Typography variant="h5" component="div">
          {title}
        </Typography>

        <Button
          autoFocus
          color="inherit"
          onClick={() => {
            if (formData) onSave(formData);
          }}
          disabled={!isFormValid}
        >
          {t('common.save')}
        </Button>
      </Toolbar>
    </AppBar>
  );
};
