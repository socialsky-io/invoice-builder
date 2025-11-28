import { Box, ListItemButton, ListItemText, Typography } from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { InvoiceFromData } from '../../../shared/types/invoice';

interface Props {
  invoiceForm?: InvoiceFromData;
  onEdit: () => void;
}

export const BusinessSelector: FC<Props> = ({ invoiceForm, onEdit }) => {
  const { t } = useTranslation();

  return (
    <ListItemButton
      onClick={onEdit}
      sx={{
        pt: 2,
        pb: 2,
        pl: 2,
        pr: 2,
        width: '100%',
        borderRadius: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'start',
        flexDirection: 'column'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'start',
          alignItems: 'center',
          width: '100%',
          gap: 2
        }}
      >
        <ListItemText
          primary={
            <Typography
              component="div"
              variant="body1"
              sx={{ fontWeight: 600, color: 'primary.main', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {t('businesses.title').toUpperCase()}
            </Typography>
          }
          secondary={
            <Typography
              component="div"
              variant="body2"
              sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {invoiceForm?.businessNameSnapshot}
            </Typography>
          }
          disableTypography
          sx={{ m: 0 }}
          slotProps={{ primary: { sx: { fontWeight: 500, m: 0 } } }}
        />
        {invoiceForm?.businessLogoSnapshot ? (
          <img
            src={invoiceForm.businessLogoSnapshot}
            alt={t('invoices.businessLogo')}
            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              width: '60px',
              height: '60px',
              background: 'primary.main',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 1,
              fontWeight: 500,
              overflow: 'hidden'
            }}
          >
            {invoiceForm?.businessShortName}
          </Box>
        )}
      </Box>
    </ListItemButton>
  );
};
