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

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <ListItemButton onClick={() => onEdit(item)} sx={{ p: 2 }}>
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
          primary={item.name}
          disableTypography
          secondary={
            <>
              {item.email && (
                <Typography component="div" variant="body2" color="text.secondary">
                  {item.email}
                </Typography>
              )}
              {item.phone && (
                <Typography component="div" variant="body2" color="text.secondary">
                  {item.phone}
                </Typography>
              )}
            </>
          }
          slotProps={{ primary: { sx: { fontWeight: 600 } } }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, height: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
            <Typography variant="body2">
              {item.invoiceCount} {item.invoiceCount > 1 ? t('common.invoices') : t('common.invoice')}
            </Typography>
            {storeSettings?.quotesON && (
              <Typography variant="body2">
                {item.quotesCount} {item.quotesCount > 1 ? t('common.quotes') : t('common.quote')}
              </Typography>
            )}
          </Box>

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
      </ListItemButton>
    </Paper>
  );
};
