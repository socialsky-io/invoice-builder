import type { FilterType } from '../enums/filterType';
import type { Settings, SettingsUpdate } from '../types/settings';
import type { Business, BusinessAdd, BusinessUpdate } from './business';
import type { Category, CategoryAdd, CategoryUpdate } from './category';
import type { Client, ClientAdd, ClientUpdate } from './client';
import type { Currency, CurrencyAdd, CurrencyUpdate } from './currency';
import type { Item, ItemAdd, ItemUpdate } from './item';
import type { Unit, UnitAdd, UnitUpdate } from './unit';

declare global {
  interface Window {
    electronAPI: {
      ping: () => void;

      openUrl: (url: string) => Promise<void>;

      getAllSettings: () => Promise<Settings>;
      updateSettings: (data: SettingsUpdate) => Promise<{ success: boolean; message?: string }>;

      getAllBusinesses: (filter?: FilterType) => Promise<Business[]>;
      updateBusiness: (data: BusinessUpdate) => Promise<{ success: boolean; message?: string }>;
      deleteBusiness: (id: number) => Promise<{ success: boolean; message?: string }>;
      addBusiness: (data: BusinessAdd) => Promise<{ success: boolean; message?: string }>;
      addBatchBusiness: (data: BusinessAdd[]) => Promise<{ success: boolean; message?: string }>;

      getAllClients: (filter?: FilterType) => Promise<Client[]>;
      updateClient: (data: ClientUpdate) => Promise<{ success: boolean; message?: string }>;
      deleteClient: (id: number) => Promise<{ success: boolean; message?: string }>;
      addClient: (data: ClientAdd) => Promise<{ success: boolean; message?: string }>;
      addBatchClient: (data: ClientAdd[]) => Promise<{ success: boolean; message?: string }>;

      getAllItems: (filter?: FilterType) => Promise<Item[]>;
      updateItem: (data: ItemUpdate) => Promise<{ success: boolean; message?: string }>;
      deleteItem: (id: number) => Promise<{ success: boolean; message?: string }>;
      addItem: (data: ItemAdd) => Promise<{ success: boolean; message?: string }>;
      addBatchItem: (data: ItemAdd[]) => Promise<{ success: boolean; message?: string }>;

      getAllUnits: (filter?: FilterType) => Promise<Unit[]>;
      updateUnit: (data: UnitUpdate) => Promise<{ success: boolean; message?: string }>;
      deleteUnit: (id: number) => Promise<{ success: boolean; message?: string }>;
      addUnit: (data: UnitAdd) => Promise<{ success: boolean; message?: string }>;
      addBatchUnit: (data: UnitAdd[]) => Promise<{ success: boolean; message?: string }>;

      getAllCategories: (filter?: FilterType) => Promise<Category[]>;
      updateCategory: (data: CategoryUpdate) => Promise<{ success: boolean; message?: string }>;
      deleteCategory: (id: number) => Promise<{ success: boolean; message?: string }>;
      addCategory: (data: CategoryAdd) => Promise<{ success: boolean; message?: string }>;
      addBatchCategory: (data: CategoryAdd[]) => Promise<{ success: boolean; message?: string }>;

      getAllCurrencies: (filter?: FilterType) => Promise<Currency[]>;
      updateCurrency: (data: CurrencyUpdate) => Promise<{ success: boolean; message?: string }>;
      deleteCurrency: (id: number) => Promise<{ success: boolean; message?: string }>;
      addCurrency: (data: CurrencyAdd) => Promise<{ success: boolean; message?: string }>;
      addBatchCurrency: (data: CurrencyAdd[]) => Promise<{ success: boolean; message?: string }>;
    };
  }
}

export {};
