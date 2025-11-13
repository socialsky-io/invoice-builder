import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import type { AmountFormat } from '../enums/amountFormat';
import type { DateFormat } from '../enums/dateFormat';
import type { Language } from '../enums/language';
import type { Settings } from '../types/settings';
import type { ToastProps } from '../types/toastProps';
import type { RootState } from './configureStore';
import type { PageState } from './pageState';

const initialState: PageState = {
  isLoading: false,
  toasts: [],
  settings: undefined
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
    setMode: (state, action: PayloadAction<boolean>) => {
      if (!state.settings) return;
      state.settings = {
        ...state.settings,
        isDarkMode: action.payload
      };
    },
    setQuates: (state, action: PayloadAction<boolean>) => {
      if (!state.settings) return;
      state.settings = {
        ...state.settings,
        quatesON: action.payload
      };
    },
    setReports: (state, action: PayloadAction<boolean>) => {
      if (!state.settings) return;
      state.settings = {
        ...state.settings,
        reportsON: action.payload
      };
    },
    setCardOverviews: (state, action: PayloadAction<boolean>) => {
      if (!state.settings) return;
      state.settings = {
        ...state.settings,
        overviewCardsON: action.payload
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

export const {
  enableLoading,
  enableLoadingCursor,
  disableLoadingCursor,
  disableLoading,
  addToast,
  removeToast,
  setSettings,
  setMode,
  setQuates,
  setReports,
  setCardOverviews,
  setCustomInvoiseSettings,
  setLanguageDate
} = pageSlice.actions;

export const pageReducer = pageSlice.reducer;
