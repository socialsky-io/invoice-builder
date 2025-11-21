import type { FilterType } from '../enums/filterType';
import type { Settings, SettingsUpdate } from '../types/settings';
import type { Business, BusinessAdd, BusinessUpdate } from './business';
import type { Category, CategoryAdd, CategoryUpdate } from './category';
import type { Client, ClientAdd, ClientUpdate } from './client';
import type { Currency, CurrencyAdd, CurrencyUpdate } from './currency';
import type { DBSelector } from './dbSelector';
import type { Item, ItemAdd, ItemUpdate } from './item';
import type { Response } from './response';
import type { Unit, UnitAdd, UnitUpdate } from './unit';

declare global {
  interface Window {
    electronAPI: {
      ping: () => void;

      openUrl: (url: string) => Promise<void>;
      selectDatabase: () => Promise<Response<DBSelector>>;
      openDatabase: () => Promise<Response<DBSelector>>;
      initializeDatabase: (data: { fullPath: string; mode?: 'open' | 'create' }) => Promise<Response<unknown>>;

      getAllSettings: () => Promise<Response<Settings>>;
      updateSettings: (data: SettingsUpdate) => Promise<Response<SettingsUpdate>>;

      getAllBusinesses: (filter?: FilterType) => Promise<Response<Business[]>>;
      updateBusiness: (data: BusinessUpdate) => Promise<Response<BusinessUpdate>>;
      deleteBusiness: (id: number) => Promise<Response<unknown>>;
      addBusiness: (data: BusinessAdd) => Promise<Response<BusinessAdd>>;
      addBatchBusiness: (data: BusinessAdd[]) => Promise<Response<BusinessAdd[]>>;

      getAllClients: (filter?: FilterType) => Promise<Response<Client[]>>;
      updateClient: (data: ClientUpdate) => Promise<Response<ClientUpdate>>;
      deleteClient: (id: number) => Promise<Response<unknown>>;
      addClient: (data: ClientAdd) => Promise<Response<ClientAdd>>;
      addBatchClient: (data: ClientAdd[]) => Promise<Response<ClientAdd[]>>;

      getAllItems: (filter?: FilterType) => Promise<Response<Item[]>>;
      updateItem: (data: ItemUpdate) => Promise<Response<ItemUpdate>>;
      deleteItem: (id: number) => Promise<Response<unknown>>;
      addItem: (data: ItemAdd) => Promise<Response<ItemAdd>>;
      addBatchItem: (data: ItemAdd[]) => Promise<Response<ItemAdd[]>>;

      getAllUnits: (filter?: FilterType) => Promise<Response<Unit[]>>;
      updateUnit: (data: UnitUpdate) => Promise<Response<UnitUpdate>>;
      deleteUnit: (id: number) => Promise<Response<unknown>>;
      addUnit: (data: UnitAdd) => Promise<Response<UnitAdd>>;
      addBatchUnit: (data: UnitAdd[]) => Promise<Response<UnitAdd[]>>;

      getAllCategories: (filter?: FilterType) => Promise<Response<Category[]>>;
      updateCategory: (data: CategoryUpdate) => Promise<Response<CategoryUpdate>>;
      deleteCategory: (id: number) => Promise<Response<unknown>>;
      addCategory: (data: CategoryAdd) => Promise<Response<CategoryAdd>>;
      addBatchCategory: (data: CategoryAdd[]) => Promise<Response<CategoryAdd[]>>;

      getAllCurrencies: (filter?: FilterType) => Promise<Response<Currency[]>>;
      updateCurrency: (data: CurrencyUpdate) => Promise<Response<CurrencyUpdate>>;
      deleteCurrency: (id: number) => Promise<Response<unknown>>;
      addCurrency: (data: CurrencyAdd) => Promise<Response<CurrencyAdd>>;
      addBatchCurrency: (data: CurrencyAdd[]) => Promise<Response<CurrencyAdd[]>>;
    };
  }
}

export {};
