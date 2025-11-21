import { CloseOutlined } from '@mui/icons-material';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Box,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  SwipeableDrawer,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { useState, type ChangeEvent, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { Filter } from '../../types/filter';

interface Props {
  filters: Filter[];
  selectedFilter?: Filter;
  onFilter?: (filter: Filter) => void;
}
export const BottomFilterSheet: FC<Props> = ({ filters, onFilter = () => {}, selectedFilter }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => {
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  const onSelectedFilter = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const filter = filters.find(item => item.value.toString() === value);

    if (filter) {
      onFilter(filter);
    }

    onClose();
  };

  return (
    <>
      <Tooltip title={t('ariaLabel.filters')}>
        <IconButton color="primary" onClick={onOpen} aria-label={t('ariaLabel.filters')}>
          <FilterListIcon />
        </IconButton>
      </Tooltip>

      <SwipeableDrawer
        anchor="bottom"
        open={isOpen}
        onClose={onClose}
        onOpen={onOpen}
        slotProps={{
          paper: {
            sx: {
              maxWidth: '40%',
              mx: 'auto',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              p: 3
            }
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {t('common.selectFilterType')}
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            <Tooltip title={t('ariaLabel.back')}>
              <IconButton
                onClick={onClose}
                aria-label={t('ariaLabel.back')}
                sx={{
                  color: theme.palette.secondary.main
                }}
              >
                <CloseOutlined fontSize="medium" />
              </IconButton>
            </Tooltip>
          </Box>

          <RadioGroup
            value={selectedFilter?.value ?? ''}
            onChange={onSelectedFilter}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {filters.map(item => (
              <FormControlLabel
                key={item.value.toString()}
                value={item.value}
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">{item.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        </Box>
      </SwipeableDrawer>
    </>
  );
};
