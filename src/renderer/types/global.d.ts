import type { FilterType } from '../enums/filterType';
import type { Settings, SettingsUpdate } from '../types/settings';
import type { Business, BusinessAdd, BusinessUpdate } from './business';
import type { Client, ClientAdd, ClientUpdate } from './client';

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
    };
  }
}

export {};
