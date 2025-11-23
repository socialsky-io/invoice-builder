import DeleteIcon from '@mui/icons-material/Delete';
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
import { darken, lighten } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../state/configureStore';
import { selectSettings } from '../../../../state/pageSlice';
import { Themes } from '../../../enums/themes';

interface GenericListProps<T extends { id: number }> {
  item: T;
  selectedItem?: T;
  onEdit: (item: T) => void;
  onDelete: (id: number) => void;
  getShortName?: (item: T) => string;
  getName: (item: T) => string;
  getEmail?: (item: T) => string | undefined;
  getPhone?: (item: T) => string | undefined;
  getAdditional?: (item: T) => string | undefined;
  getInvoiceCount: (item: T) => number;
  getQuotesCount?: (item: T) => number;
  getIsArchived?: (item: T) => boolean;
}
export const GenericList = <T extends { id: number }>({
  item,
  selectedItem,
  onEdit,
  onDelete,
  getShortName,
  getName,
  getEmail,
  getPhone,
  getInvoiceCount,
  getQuotesCount,
  getAdditional,
  getIsArchived
}: GenericListProps<T>) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const storeSettings = useAppSelector(selectSettings);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const shortName = getShortName?.(item);
  const name = getName(item);
  const email = getEmail?.(item);
  const phone = getPhone?.(item);
  const invoiceCount = getInvoiceCount(item);
  const quotesCount = getQuotesCount?.(item);
  const additional = getAdditional?.(item);
  const isArchived = getIsArchived?.(item);

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 1,
        bgcolor:
          item.id === selectedItem?.id
            ? theme.palette.mode === Themes.dark
              ? darken(theme.palette.primary.main, 0.9)
              : lighten(theme.palette.primary.main, 0.9)
            : theme.palette.background.paper,
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
            flexDirection: 'column',
            justifyContent: 'start',
            alignItems: 'center',
            width: '100%',
            gap: 2
          }}
        >
          {isArchived && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexDirection: 'row', width: '100%' }}>
              <Box sx={{ flexGrow: 1 }} />
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: theme.palette.grey[700],
                  flexShrink: 0
                }}
              />
              <Typography
                color={theme.palette.text.secondary}
                component="div"
                variant="body1"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {t('common.archived').toUpperCase()}
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'start',
              alignItems: 'center',
              width: '100%'
            }}
          >
            {shortName && (
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
                  {shortName}
                </Box>
              </ListItemIcon>
            )}

            <ListItemText
              primary={
                <Typography
                  component="div"
                  variant="body1"
                  sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {name}
                </Typography>
              }
              disableTypography
              secondary={
                <>
                  {additional && (
                    <Typography
                      component="div"
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {additional}
                    </Typography>
                  )}
                  {email && (
                    <Typography
                      component="div"
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {email}
                    </Typography>
                  )}
                  {phone && (
                    <Typography
                      component="div"
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {phone}
                    </Typography>
                  )}
                </>
              }
              sx={{ m: 0 }}
              slotProps={{ primary: { sx: { fontWeight: 600, m: 0 } } }}
            />

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              {!isMobile && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end', whiteSpace: 'nowrap' }}>
                  <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {invoiceCount} {invoiceCount > 1 ? t('common.invoices') : t('common.invoice')}
                  </Typography>
                  {storeSettings?.quotesON && quotesCount !== undefined && (
                    <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {quotesCount} {quotesCount > 1 ? t('common.quotes') : t('common.quote')}
                    </Typography>
                  )}
                </Box>
              )}

              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

              <Box sx={{ display: 'flex', gap: 0.5 }}>
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
        </Box>

        {isMobile && (
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, whiteSpace: 'nowrap', mt: 2 }}>
            <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {invoiceCount} {invoiceCount > 1 ? t('common.invoices') : t('common.invoice')}
            </Typography>
            {storeSettings?.quotesON && quotesCount !== undefined && (
              <>
                <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t('common.and')}
                </Typography>
                <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {quotesCount} {quotesCount > 1 ? t('common.quotes') : t('common.quote')}
                </Typography>
              </>
            )}
          </Box>
        )}
      </ListItemButton>
    </Paper>
  );
};
