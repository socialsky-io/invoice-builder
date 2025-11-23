import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
  showBack: boolean;
  showSave?: boolean;
  onBack?: () => void;
  onSave?: (data: unknown) => void;
  formData?: unknown;
  isFormValid?: boolean;
}
export const PageHeader: FC<Props> = ({
  title,
  showBack = false,
  isFormValid,
  formData,
  showSave,
  onBack = () => {},
  onSave = () => {}
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {showBack && (
        <Tooltip title={t('ariaLabel.back')}>
          <IconButton onClick={onBack} aria-label={t('ariaLabel.back')} sx={{ color: theme.palette.secondary.main }}>
            <ArrowBackIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
      )}

      <Typography variant="h5" noWrap component="div" sx={{ color: theme.palette.secondary.main }}>
        {title}
      </Typography>

      <Box sx={{ flexGrow: 1 }} />

      {showSave && (
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
      )}
    </Box>
  );
};
