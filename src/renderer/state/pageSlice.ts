import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import type { AmountFormat } from '../shared/enums/amountFormat';
import type { DateFormat } from '../shared/enums/dateFormat';
import type { Language } from '../shared/enums/language';
import type { BusinessModified } from '../shared/types/business';
import type { Category } from '../shared/types/category';
import type { Client } from '../shared/types/client';
import type { Currency } from '../shared/types/currency';
import type { InvoicesModified } from '../shared/types/invoice';
import type { Item } from '../shared/types/item';
import type { PageState } from '../shared/types/pageState';
import type { Settings } from '../shared/types/settings';
import type { ToastProps } from '../shared/types/toastProps';
import type { Unit } from '../shared/types/unit';
import type { RootState } from './configureStore';

const initialState: PageState = {
  isLoading: false,
  toasts: [],
  settings: undefined,
  businesses: [],
  clients: [],
  items: [],
  currencies: [],
  units: [],
  categories: [],
  invoices: []
};

export const pageSlice = createSlice({
  name: 'pageSlice',
  initialState,
  reducers: {
    enableLoadingCursor: () => {
      document.body.style.cursor = 'wait';
    },
    disableLoadingCursor: () => {
      document.body.style.cursor = 'default';
    },
    enableLoading: state => {
      state.isLoading = true;
    },
    disableLoading: state => {
      state.isLoading = false;
    },
    addToast: (state, action: PayloadAction<ToastProps>) => {
      state.toasts.push({
        ...action.payload,
        id: uuidv4()
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    setSettings: (state, action: PayloadAction<Settings>) => {
      state.settings = action.payload;
    },
    setBusinesses: (state, action: PayloadAction<BusinessModified[]>) => {
      state.businesses = action.payload;
    },
    setClients: (state, action: PayloadAction<Client[]>) => {
      state.clients = action.payload;
    },
    setItems: (state, action: PayloadAction<Item[]>) => {
      state.items = action.payload;
    },
    setCurrencies: (state, action: PayloadAction<Currency[]>) => {
      state.currencies = action.payload;
    },
    setUnits: (state, action: PayloadAction<Unit[]>) => {
      state.units = action.payload;
    },
    setInvoices: (state, action: PayloadAction<InvoicesModified[]>) => {
      state.invoices = action.payload;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setMode: (state, action: PayloadAction<boolean>) => {
      if (!state.settings) return;
      state.settings = {
        ...state.settings,
        isDarkMode: action.payload
      };
    },
    setQuotes: (state, action: PayloadAction<boolean>) => {
      if (!state.settings) return;
      state.settings = {
        ...state.settings,
        quotesON: action.payload
      };
    },
    setReports: (state, action: PayloadAction<boolean>) => {
      if (!state.settings) return;
      state.settings = {
        ...state.settings,
        reportsON: action.payload
      };
    },
    setCustomInvoiseSettings: (
      state,
      action: PayloadAction<{
        invoiceSuffix?: string;
        invoicePrefix?: string;
        shouldIncludeMonth: boolean;
        shouldIncludeYear: boolean;
        shouldIncludeBusinessName: boolean;
      }>
    ) => {
      if (!state.settings) return;
      state.settings = {
        ...state.settings,
        invoicePrefix: action.payload.invoicePrefix,
        invoiceSuffix: action.payload.invoiceSuffix,
        shouldIncludeMonth: action.payload.shouldIncludeMonth,
        shouldIncludeYear: action.payload.shouldIncludeYear,
        shouldIncludeBusinessName: action.payload.shouldIncludeBusinessName
      };
    },
    setLanguageDate: (
      state,
      action: PayloadAction<{
        language: Language;
        amountFormat: AmountFormat;
        dateFormat: DateFormat;
      }>
    ) => {
      if (!state.settings) return;
      state.settings = {
        ...state.settings,
        language: action.payload.language,
        amountFormat: action.payload.amountFormat,
        dateFormat: action.payload.dateFormat
      };
    }
  }
});

export const selectState = (state: RootState) => state.pageSlice;
export const selectIsLoading = createSelector(selectState, state => state.isLoading);
export const selectToasts = createSelector(selectState, state => state.toasts);
export const selectSettings = createSelector(selectState, state => state.settings);
export const selectBusinesses = createSelector(selectState, state => state.businesses);
export const selectClients = createSelector(selectState, state => state.clients);
export const selectCategories = createSelector(selectState, state => state.categories);
export const selectCurrencies = createSelector(selectState, state => state.currencies);
export const selectUnits = createSelector(selectState, state => state.units);
export const selectItems = createSelector(selectState, state => state.items);
export const selectInvoices = createSelector(selectState, state => state.invoices);

export const selectUnitsOptions = createSelector(selectState, state =>
  state.units.map(u => {
    return { label: u.name, value: u.id };
  })
);
export const selectCategoriesOptions = createSelector(selectState, state =>
  state.categories.map(c => {
    return { label: c.name, value: c.id };
  })
);

export const {
  enableLoading,
  enableLoadingCursor,
  disableLoadingCursor,
  disableLoading,
  addToast,
  removeToast,
  setSettings,
  setMode,
  setQuotes,
  setReports,
  setClients,
  setCustomInvoiseSettings,
  setLanguageDate,
  setBusinesses,
  setItems,
  setCategories,
  setCurrencies,
  setUnits,
  setInvoices
} = pageSlice.actions;

export const pageReducer = pageSlice.reducer;
