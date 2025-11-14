import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Divider,
  Fab,
  Grid,
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
import { useCallback, useEffect, useMemo, useState, type FC, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Content } from '../../components/content/Content';
import { FilterSortBar } from '../../components/filterSortBar/FilterSortBar';
import { NoItem } from '../../components/noItem/NoItem';
import { PageAppBar } from '../../components/pageAppBar/PageAppBar';
import { SearchInput } from '../../components/searchInput/SearchInput';
import { SortType } from '../../enums/sortType';
import { Themes } from '../../enums/themes';
import { useBusinessAdd } from '../../hooks/business/useBusinessAdd';
import { useBusinessDelete } from '../../hooks/business/useBusinessDelete';
import { useBusinessesRetrieve } from '../../hooks/business/useBusinessesRetrieve';
import { useBusinessUpdate } from '../../hooks/business/useBusinessUpdate';
import { useAppSelector } from '../../state/configureStore';
import { filterAndSortArray, isCRBusinessFromData, toUint8Array } from '../../state/functions';
import { selectSettings } from '../../state/pageSlice';
import type { Business, BusinessAdd, BusinessUpdate } from '../../types/business';
import { Form } from './Form';

export const Businesses: FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const storeSettings = useAppSelector(selectSettings);
  const [isCRModalOpen, setIsCRModalOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | undefined>(undefined);
  const [changedBusiness, setChangedBusiness] = useState<BusinessUpdate | undefined>(undefined);
  const [newBusiness, setNewBusiness] = useState<BusinessAdd | undefined>(undefined);
  const [selectedBusinessID, setSelectedBusinessID] = useState<number>(-1);
  const { businesses, execute: reloadBusinesses } = useBusinessesRetrieve({});
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const sortOptions = [
    { label: t('common.name'), value: 'name' },
    { label: t('common.lastUpdate'), value: 'updatedAt' }
  ];
  const [activeSort, setActiveSort] = useState<SortType>(SortType.DEFAULT);
  const [activeSortBy, setActiveSortBy] = useState(sortOptions[0]);

  const onFilterSortChange = (data: { sortBy: { label: string; value: string }; sort: SortType }) => {
    setActiveSort(data.sort);
    setActiveSortBy(data.sortBy);
  };

  const filteredBusinesses = useMemo(() => {
    return filterAndSortArray(businesses, searchValue, 'name', activeSortBy.value as keyof Business, activeSort);
  }, [businesses, searchValue, activeSort, activeSortBy]);

  const { execute: deleteBusiness } = useBusinessDelete({
    id: selectedBusinessID,
    immediate: false,
    onDone: useCallback(() => {
      setSelectedBusiness(undefined);
      reloadBusinesses();
    }, [])
  });
  const { execute: addBusiness } = useBusinessAdd({
    business: newBusiness,
    immediate: false,
    onDone: useCallback(() => {
      setNewBusiness(undefined);
      setSelectedBusiness(undefined);
      reloadBusinesses();
    }, [])
  });
  const { execute: updateBusiness } = useBusinessUpdate({
    business: changedBusiness,
    immediate: false,
    onDone: useCallback(() => {
      setChangedBusiness(undefined);
      setSelectedBusiness(undefined);
      reloadBusinesses();
    }, [])
  });

  const onDelete = (id: number) => {
    setSelectedBusinessID(id);
  };

  const handleCloseCRModal = useCallback(() => {
    setIsCRModalOpen(false);
    setSelectedBusiness(undefined);
  }, []);

  const onEdit = (item: Business) => {
    setSelectedBusiness(item);
  };

  const onAdd = () => {
    setSelectedBusiness(undefined);
    setIsCRModalOpen(true);
  };

  const onSearchChanged = useCallback(
    (value: string) => {
      setSearchValue(value);
    },
    [searchValue]
  );

  const handleSaveCRModal = async (data: unknown) => {
    if (isCRBusinessFromData(data)) {
      let convertedLogo: Uint8Array<ArrayBufferLike> | null | undefined = undefined;
      if (typeof data.logo !== 'undefined') {
        convertedLogo = await toUint8Array(data.logo);
      }
      if (typeof data.id === 'undefined') {
        setNewBusiness({
          ...data,
          logo: convertedLogo
        });
      } else if (data.id) {
        setChangedBusiness({
          ...data,
          id: data.id,
          logo: convertedLogo
        });
      }
      handleCloseCRModal();
    }
  };

  useEffect(() => {
    if (selectedBusinessID === -1) return;
    deleteBusiness();
  }, [selectedBusinessID, deleteBusiness]);

  useEffect(() => {
    if (typeof newBusiness === 'undefined') return;
    addBusiness();
  }, [newBusiness, addBusiness]);

  useEffect(() => {
    if (typeof changedBusiness === 'undefined') return;
    updateBusiness();
  }, [changedBusiness, updateBusiness]);

  const leftColumn = (
    <Grid size={{ xs: 12, md: 4 }} component="div" sx={{ position: 'relative' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{
              color: theme.palette.secondary.main
            }}
          >
            {t('menuItems.businesses')}
          </Typography>
        </Box>

        <SearchInput value={searchValue} onChange={onSearchChanged} />

        <FilterSortBar
          sortByOptions={sortOptions}
          activeSort={activeSort}
          activeSortBy={activeSortBy}
          onChange={onFilterSortChange}
        />

        {filteredBusinesses.map(item => (
          <Paper
            key={item.id}
            elevation={2}
            sx={{
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ListItemButton
              onClick={() => onEdit(item)}
              sx={{
                p: 2
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
                slotProps={{
                  primary: {
                    sx: { fontWeight: 600 }
                  }
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',

                  gap: 1,
                  ml: 2,
                  height: '100%'
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
                  <Typography variant="body2">
                    {item.invoiceCount} {item.invoiceCount > 1 ? t('businesses.invoices') : t('businesses.invoice')}
                  </Typography>
                  {storeSettings?.quatesON && (
                    <Typography variant="body2">
                      {item.quatesCount} {item.quatesCount > 1 ? t('businesses.quotes') : t('businesses.quote')}
                    </Typography>
                  )}
                </Box>

                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title={t('ariaLabel.edit')}>
                    <IconButton
                      size="small"
                      color="primary"
                      aria-label={t('ariaLabel.edit')}
                      onClick={() => onEdit(item)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('ariaLabel.delete')}>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={t('ariaLabel.delete')}
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
        ))}
      </Box>
      <Tooltip title={t('ariaLabel.add')}>
        <Fab
          color="primary"
          aria-label={t('ariaLabel.add')}
          onClick={onAdd}
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 10,
            zIndex: 1000
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Grid>
  );

  const noItemButton = (
    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={onAdd}>
      {t('businesses.add')}
    </Button>
  );

  const crBusiness = (
    <PageAppBar
      title={t('businessesCRModal.title')}
      isOpen={isCRModalOpen}
      isModal={typeof selectedBusiness?.id === 'undefined'}
      handleClose={handleCloseCRModal}
      handleSave={handleSaveCRModal}
      renderForm={({ onChange }) => (
        <Form
          business={selectedBusiness}
          handleChange={data => {
            if (isCRBusinessFromData(data.business)) {
              onChange({
                changedData: data.business,
                isFormValid: data.isFormValid
              });
            }
          }}
        />
      )}
      showBack={!isDesktop}
    />
  );
  let rightColumn: ReactNode;
  if (typeof selectedBusiness?.id === 'undefined') {
    rightColumn = <NoItem text={t('businesses.noItem')} node={noItemButton} />;
  } else {
    rightColumn = crBusiness;
  }

  return (
    <>
      {isCRModalOpen && crBusiness}
      <Grid container component="div" spacing={2} justifyContent="center" alignItems="stretch" sx={{ height: '100%' }}>
        {isDesktop ? (
          <>
            {leftColumn}
            <Content node={rightColumn} />
          </>
        ) : (
          <>{typeof selectedBusiness === 'undefined' ? leftColumn : <Content node={rightColumn} />}</>
        )}
      </Grid>
    </>
  );
};
