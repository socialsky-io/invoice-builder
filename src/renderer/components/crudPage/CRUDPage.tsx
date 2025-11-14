import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Fab, Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SortType } from '../../enums/sortType';
import { filterAndSortArray } from '../../state/functions';
import type { CustomOption } from '../../types/customOption';
import { Content } from '../content/Content';
import { FilterSortBar } from '../filterSortBar/FilterSortBar';
import { NoItem } from '../noItem/NoItem';
import { PageAppBar } from '../pageAppBar/PageAppBar';
import { SearchInput } from '../searchInput/SearchInput';

interface Props<T extends { id?: number }, TAdd, TUpdate extends { id?: number }> {
  title: string;
  useRetrieve: () => { items: T[]; execute: () => void };
  useAdd: (args: { item?: TAdd; immediate?: boolean; onDone?: () => void }) => { execute: () => void };
  useUpdate: (args: { item?: TUpdate; immediate?: boolean; onDone?: () => void }) => { execute: () => void };
  useDelete: (args: { id: number; immediate?: boolean; onDone?: () => void }) => { execute: () => void };
  searchField: keyof T;
  validateAndNormalize: (data: unknown) => TAdd | TUpdate | undefined;
  form: (args: {
    item?: T;
    onChange: (data: { changedData: TAdd | TUpdate; isFormValid: boolean }) => void;
  }) => ReactNode;
  sortOptions: { label: string; value: keyof T }[];
  noItemButtonText: string;
  noItemText: string;
  leftTitle: string;
  renderListItem: (item: T, onEdit: (item: T) => void, onDelete: (id: number) => void) => ReactNode;
}

export const CRUDPage = <T extends { id?: number }, TAdd, TUpdate extends { id?: number }>(
  props: Props<T, TAdd, TUpdate>
) => {
  const { t } = useTranslation();
  const {
    title,
    searchField,
    noItemButtonText,
    useRetrieve,
    useAdd,
    useUpdate,
    useDelete,
    renderListItem,
    noItemText,
    leftTitle,
    validateAndNormalize,
    sortOptions,
    form
  } = props;
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { items, execute: reload } = useRetrieve();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | undefined>(undefined);
  const [searchValue, setSearchValue] = useState('');
  const [sortBy, setSortBy] = useState(sortOptions[0]);
  const [sortType, setSortType] = useState<SortType>(SortType.DEFAULT);
  const [deleteID, setDeleteID] = useState<number>(-1);
  const [newItem, setNewItem] = useState<TAdd | undefined>(undefined);
  const [changedItem, setChangedItem] = useState<TUpdate | undefined>(undefined);

  const { execute: addItem } = useAdd({
    item: newItem,
    immediate: false,
    onDone: () => {
      setNewItem(undefined);
      setSelectedItem(undefined);
      reload();
    }
  });

  const { execute: updateItem } = useUpdate({
    item: changedItem,
    immediate: false,
    onDone: () => {
      setChangedItem(undefined);
      setSelectedItem(undefined);
      reload();
    }
  });

  const { execute: deleteItem } = useDelete({
    id: deleteID,
    immediate: false,
    onDone: () => {
      setDeleteID(-1);
      setSelectedItem(undefined);
      reload();
    }
  });

  const filteredItems = useMemo(() => {
    return filterAndSortArray(items, searchValue, searchField, sortBy.value, sortType);
  }, [items, searchValue, searchField, sortBy, sortType]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItem(undefined);
  }, []);

  const isUpdate = (item: TAdd | TUpdate): item is TUpdate => {
    return (item as TUpdate).id !== undefined;
  };

  const onAdd = () => {
    setSelectedItem(undefined);
    setIsModalOpen(true);
  };

  const handleSave = async (data: unknown) => {
    const normalized = validateAndNormalize(data);
    if (!normalized) return;

    if (isUpdate(normalized)) {
      setChangedItem(normalized as TUpdate);
    } else {
      setNewItem(normalized as TAdd);
    }
    handleCloseModal();
  };

  const onSearchChanged = useCallback(
    (value: string) => {
      setSearchValue(value);
    },
    [searchValue]
  );

  const onFilterSortChange = (data: { sortBy: CustomOption<keyof T>; sort: SortType }) => {
    setSortType(data.sort);
    setSortBy(data.sortBy);
  };

  const onEdit = (item: T) => {
    setSelectedItem(item);
  };

  const onDelete = (id: number) => {
    setDeleteID(id);
  };

  useEffect(() => {
    if (deleteID !== -1) deleteItem();
  }, [deleteID]);

  useEffect(() => {
    if (newItem !== undefined) addItem();
  }, [newItem]);

  useEffect(() => {
    if (changedItem !== undefined) updateItem();
  }, [changedItem]);

  const noItemButton = (
    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={onAdd}>
      {noItemButtonText}
    </Button>
  );

  const crBusiness = (
    <PageAppBar
      title={title}
      isOpen={isModalOpen}
      isModal={typeof selectedItem?.id === 'undefined'}
      handleClose={handleCloseModal}
      handleSave={handleSave}
      renderForm={({ onChange }) =>
        form({
          item: selectedItem,
          onChange
        })
      }
      showBack={!isDesktop}
    />
  );

  let rightColumn: ReactNode;
  if (typeof selectedItem?.id === 'undefined') {
    rightColumn = <NoItem text={noItemText} node={noItemButton} />;
  } else {
    rightColumn = crBusiness;
  }

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
            {leftTitle}
          </Typography>
        </Box>

        <SearchInput value={searchValue} onChange={onSearchChanged} />

        <FilterSortBar<keyof T>
          sortByOptions={sortOptions}
          activeSort={sortType}
          activeSortBy={sortBy}
          onChange={onFilterSortChange}
        />

        {filteredItems.map(item => renderListItem(item, onEdit, onDelete))}
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

  return (
    <>
      {isModalOpen && crBusiness}
      <Grid container component="div" spacing={2} justifyContent="center" alignItems="stretch" sx={{ height: '100%' }}>
        {isDesktop ? (
          <>
            {leftColumn}
            <Content node={rightColumn} />
          </>
        ) : (
          <>{typeof selectedItem === 'undefined' ? leftColumn : <Content node={rightColumn} />}</>
        )}
      </Grid>
    </>
  );
};
