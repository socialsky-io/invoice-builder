import type { FilterType } from '../enums/filterType';
import type { Settings, SettingsUpdate } from '../types/settings';
import type { Business, BusinessAdd, BusinessUpdate } from './business';
import type { Category, CategoryAdd, CategoryUpdate } from './category';
import type { Client, ClientAdd, ClientUpdate } from './client';
import type { Currency, CurrencyAdd, CurrencyUpdate } from './currency';
import type { Item, ItemAdd, ItemUpdate } from './item';
import type { Response } from './response';
import type { Unit, UnitAdd, UnitUpdate } from './unit';

declare global {
  interface Window {
    electronAPI: {
      ping: () => void;

      openUrl: (url: string) => Promise<void>;

      getAllSettings: () => Promise<Response<Settings>>;
      updateSettings: (data: SettingsUpdate) => Promise<Response>;

      getAllBusinesses: (filter?: FilterType) => Promise<Response<Business[]>>;
      updateBusiness: (data: BusinessUpdate) => Promise<Response>;
      deleteBusiness: (id: number) => Promise<Response>;
      addBusiness: (data: BusinessAdd) => Promise<Response>;
      addBatchBusiness: (data: BusinessAdd[]) => Promise<Response>;

      getAllClients: (filter?: FilterType) => Promise<Response<Client[]>>;
      updateClient: (data: ClientUpdate) => Promise<Response>;
      deleteClient: (id: number) => Promise<Response>;
      addClient: (data: ClientAdd) => Promise<Response>;
      addBatchClient: (data: ClientAdd[]) => Promise<Response>;

      getAllItems: (filter?: FilterType) => Promise<Response<Item[]>>;
      updateItem: (data: ItemUpdate) => Promise<Response>;
      deleteItem: (id: number) => Promise<Response>;
      addItem: (data: ItemAdd) => Promise<Response>;
      addBatchItem: (data: ItemAdd[]) => Promise<Response>;

      getAllUnits: (filter?: FilterType) => Promise<Unit[]>;
      updateUnit: (data: UnitUpdate) => Promise<Response>;
      deleteUnit: (id: number) => Promise<Response>;
      addUnit: (data: UnitAdd) => Promise<Response>;
      addBatchUnit: (data: UnitAdd[]) => Promise<Response>;

      getAllCategories: (filter?: FilterType) => Promise<Response<Category[]>>;
      updateCategory: (data: CategoryUpdate) => Promise<Response>;
      deleteCategory: (id: number) => Promise<Response>;
      addCategory: (data: CategoryAdd) => Promise<Response>;
      addBatchCategory: (data: CategoryAdd[]) => Promise<Response>;

      getAllCurrencies: (filter?: FilterType) => Promise<Response<Currency[]>>;
      updateCurrency: (data: CurrencyUpdate) => Promise<Response>;
      deleteCurrency: (id: number) => Promise<Response>;
      addCurrency: (data: CurrencyAdd) => Promise<Response>;
      addBatchCurrency: (data: CurrencyAdd[]) => Promise<Response>;
    };
  }
}

export {};
