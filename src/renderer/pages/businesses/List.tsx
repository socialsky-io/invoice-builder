import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Divider,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Themes } from '../../enums/themes';
import { useAppSelector } from '../../state/configureStore';
import { selectSettings } from '../../state/pageSlice';
import type { Business } from '../../types/business';

interface Props {
  item: Business;
  onEdit: (item: Business) => void;
  onDelete: (id: number) => void;
}
export const List: FC<Props> = ({ item, onEdit, onDelete }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const storeSettings = useAppSelector(selectSettings);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 1,
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        transition: 'all 0.2s ease-in-out',
        minWidth: '250px'
      }}
    >
      <ListItemButton
        onClick={() => onEdit(item)}
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
            width: '100%'
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor:
                  theme.palette.mode === Themes.dark ? theme.palette.secondary.dark : theme.palette.secondary.light,
                color: theme.palette.text.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 14
              }}
            >
              {item.shortName}
            </Box>
          </ListItemIcon>

          <ListItemText
            primary={
              <>
                <Typography
                  component="div"
                  variant="body1"
                  sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {item.name}
                </Typography>
              </>
            }
            disableTypography
            secondary={
              <>
                {item.email && (
                  <Typography
                    component="div"
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {item.email}
                  </Typography>
                )}
                {item.phone && (
                  <Typography
                    component="div"
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {item.phone}
                  </Typography>
                )}
              </>
            }
            slotProps={{
              primary: { sx: { fontWeight: 600 } }
            }}
          />

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            {!isMobile && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end', whiteSpace: 'nowrap' }}>
                <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.invoiceCount} {item.invoiceCount > 1 ? t('common.invoices') : t('common.invoice')}
                </Typography>
                {storeSettings?.quotesON && (
                  <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.quotesCount} {item.quotesCount > 1 ? t('common.quotes') : t('common.quote')}
                  </Typography>
                )}
              </Box>
            )}

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title={t('ariaLabel.edit')}>
                <IconButton size="small" color="primary" onClick={() => onEdit(item)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('ariaLabel.delete')}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={e => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
        {isMobile && (
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, whiteSpace: 'nowrap' }}>
            <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.invoiceCount} {item.invoiceCount > 1 ? t('common.invoices') : t('common.invoice')}
            </Typography>
            {storeSettings?.quotesON && (
              <>
                <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t('common.and')}
                </Typography>
                <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.quotesCount} {item.quotesCount > 1 ? t('common.quotes') : t('common.quote')}
                </Typography>
              </>
            )}
          </Box>
        )}
      </ListItemButton>
    </Paper>
  );
};
