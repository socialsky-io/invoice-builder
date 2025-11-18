import AddIcon from '@mui/icons-material/Add';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Box, Button, Fab, Grid, Pagination, Stack, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterType } from '../../enums/filterType';
import { SortType } from '../../enums/sortType';
import type { CustomOption } from '../../types/customOption';
import type { Rows } from '../../types/excel';
import type { Filter } from '../../types/filter';
import { exportExcel, filterAndSortArray, importExcel } from '../../utils/functions';
import { Content } from '../content/Content';
import { BottomFilterSheet } from '../filters/Filters';
import { FilterSortBar } from '../filterSortBar/FilterSortBar';
import ImportExportButton from '../importExportButton/ImportExportButton';
import { NoItem } from '../noItem/NoItem';
import { PageAppBar } from '../pageAppBar/PageAppBar';
import { SearchInput } from '../searchInput/SearchInput';

interface Props<T, TAdd, TUpdate> {
  title: string;
  useRetrieve: (args: { filter?: FilterType }) => { items: T[]; execute: () => void };
  useAdd: (args: { item?: TAdd; immediate?: boolean; onDone?: () => void }) => {
    execute: () => void;
  };
  useAddBatch: (args: { item?: TAdd[]; immediate?: boolean; onDone?: () => void }) => { execute: () => void };
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
  excelColumns: string[];
  excelFileName: string;
  excelFormat: 'xlsx' | 'xls';
  excelTemplateData: Rows;
  filters: Filter[];
  itemsPerPage?: number;
}

export const CRUDPage = <T, TAdd, TUpdate>(props: Props<T, TAdd, TUpdate>) => {
  const { t } = useTranslation();
  const {
    title,
    excelColumns,
    excelFileName,
    excelFormat,
    excelTemplateData,
    searchField,
    noItemButtonText,
    useRetrieve,
    useAdd,
    useAddBatch,
    useUpdate,
    useDelete,
    renderListItem,
    noItemText,
    leftTitle,
    validateAndNormalize,
    sortOptions,
    form,
    itemsPerPage = 20,
    filters
  } = props;
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [selectedFilter, setSelectedFilter] = useState<Filter | undefined>(filters.find(item => item.initial));
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | undefined>(undefined);
  const [searchValue, setSearchValue] = useState('');
  const [sortBy, setSortBy] = useState(sortOptions[0]);
  const [sortType, setSortType] = useState<SortType>(SortType.DEFAULT);
  const [deleteID, setDeleteID] = useState<number>(-1);
  const [newItem, setNewItem] = useState<TAdd | undefined>(undefined);
  const [newItemsBatch, setNewItemsBatch] = useState<TAdd[] | undefined>(undefined);
  const [changedItem, setChangedItem] = useState<TUpdate | undefined>(undefined);

  const { items, execute: reload } = useRetrieve({
    filter: selectedFilter?.value
  });

  const { execute: addItem } = useAdd({
    item: newItem,
    immediate: false,
    onDone: () => {
      setNewItem(undefined);
      setSelectedItem(undefined);
      reload();
    }
  });

  const { execute: addItemsBatch } = useAddBatch({
    item: newItemsBatch,
    immediate: false,
    onDone: () => {
      setNewItemsBatch(undefined);
      setSelectedItem(undefined);
      reload();
    }
  });

  const { execute: updateItem } = useUpdate({
    item: changedItem,
    immediate: false,
    onDone: () => {
      setChangedItem(undefined);
      if (!isDesktop) setSelectedItem(undefined);
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
    return filterAndSortArray({
      data: items,
      searchValue,
      searchField,
      sortField: sortBy.value,
      sortType
    });
  }, [items, searchValue, searchField, sortBy, sortType]);

  const totalPages = useMemo(() => {
    const pages = Math.ceil(filteredItems.length / itemsPerPage);
    return pages > 0 ? pages : 1;
  }, [filteredItems.length, itemsPerPage]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    if (!isDesktop) setSelectedItem(undefined);
  }, [isDesktop]);

  const isUpdate = (item: TAdd | TUpdate): item is TUpdate => {
    return typeof item === 'object' && item !== null && 'id' in item && typeof item.id !== 'undefined';
  };

  const onAdd = () => {
    setSelectedItem(undefined);
    setIsModalOpen(true);
  };

  const handleSave = useCallback(
    async (data: unknown) => {
      const normalized = await validateAndNormalize(data);
      if (!normalized) return;

      if (isUpdate(normalized)) {
        setChangedItem(normalized as TUpdate);
      } else {
        setNewItem(normalized as TAdd);
      }
      handleCloseModal();
    },
    [validateAndNormalize, handleCloseModal]
  );

  const onSearchChanged = useCallback(
    (value: string) => {
      setSearchValue(value);
    },
    [searchValue]
  );

  const onFilterSortChange = useCallback((data: { sortBy: CustomOption<keyof T>; sort: SortType }) => {
    setSortType(data.sort);
    setSortBy(data.sortBy);
  }, []);

  const onEdit = useCallback((item: T) => {
    setSelectedItem(item);
  }, []);

  const onDelete = useCallback((id: number) => {
    setDeleteID(id);
  }, []);

  const onExportToExcel = useCallback(() => {
    exportExcel(excelColumns, items as Rows, `${excelFileName}.${excelFormat}`);
  }, [excelColumns, items, excelFileName, excelFormat]);

  const onImportExcel = useCallback(async (file: File) => {
    const result = await importExcel(file);
    setNewItemsBatch(result.rows as TAdd[]);
  }, []);

  const onDownloadTemplate = useCallback(async () => {
    exportExcel(excelColumns, excelTemplateData, `${excelFileName}_template.${excelFormat}`);
  }, [excelColumns, excelTemplateData, excelFileName, excelFormat]);

  const onFilter = useCallback((filter: Filter) => {
    setSelectedFilter(filter);
  }, []);

  const onPageChange = useCallback((_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  }, []);

  useEffect(() => {
    if (deleteID !== -1) deleteItem();
  }, [deleteID]);

  useEffect(() => {
    if (newItemsBatch !== undefined) addItemsBatch();
  }, [newItemsBatch]);

  useEffect(() => {
    if (newItem !== undefined) addItem();
  }, [newItem]);

  useEffect(() => {
    if (changedItem !== undefined) updateItem();
  }, [changedItem]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, sortBy, sortType, selectedFilter]);

  useEffect(() => {
    setCurrentPage(prev => {
      if (prev > totalPages) {
        return totalPages;
      }
      return prev;
    });
  }, [totalPages]);

  const noItemButton = (
    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={onAdd}>
      {noItemButtonText}
    </Button>
  );

  const crBusiness = (
    <PageAppBar
      title={title}
      isOpen={isModalOpen}
      isModal={typeof selectedItem === 'undefined'}
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
  if (typeof selectedItem === 'undefined') {
    rightColumn = <NoItem text={noItemText} node={noItemButton} />;
  } else {
    rightColumn = crBusiness;
  }

  const leftColumn = (
    <Grid size={{ xs: 12, md: 4 }} component="div" sx={{ position: 'relative', height: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%', overflow: 'auto' }}>
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
          <Box sx={{ flexGrow: 1 }} />
          <ImportExportButton
            onExport={onExportToExcel}
            onImport={onImportExcel}
            onDownloadTemplate={onDownloadTemplate}
          />
        </Box>

        <SearchInput value={searchValue} onChange={onSearchChanged} />

        <Box
          sx={{ display: 'flex', flexDirection: 'row', gap: 3, alignItems: 'center', justifyContent: 'space-between' }}
        >
          <BottomFilterSheet filters={filters} selectedFilter={selectedFilter} onFilter={onFilter} />

          <FilterSortBar<keyof T>
            sortByOptions={sortOptions}
            activeSort={sortType}
            activeSortBy={sortBy}
            onChange={onFilterSortChange}
          />
        </Box>

        {filteredItems.length <= 0 && (
          <NoItem
            text={
              searchValue !== '' || typeof selectedFilter !== 'undefined' ? t('common.noData') : t('common.noDataYet')
            }
            icon={<SearchOffIcon color="action" fontSize="large" />}
          />
        )}

        {paginatedItems.map(item => renderListItem(item, onEdit, onDelete))}

        <Box sx={{ flexGrow: 1 }} />

        {filteredItems.length > itemsPerPage && (
          <Stack spacing={2} alignItems="center">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={onPageChange}
              color="primary"
              shape="rounded"
              variant="outlined"
              size="small"
            />
          </Stack>
        )}

        <Box sx={{ pb: 2 }} />
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
