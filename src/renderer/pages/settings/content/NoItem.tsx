import GridView from '@mui/icons-material/GridView';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const NoItem = () => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        flexDirection: 'column'
      }}
    >
      <GridView color="action" fontSize="large" />
      <Typography variant="h5">{t('app.noItems')}</Typography>
    </Box>
  );
};
