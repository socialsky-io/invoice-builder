import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
  showBack: boolean;
  onBack?: () => void;
}
export const PageHeader: FC<Props> = ({ title, showBack = false, onBack = () => {} }) => {
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
    </Box>
  );
};
