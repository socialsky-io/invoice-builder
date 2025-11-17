import type { FilterType } from '../enums/filterType';
import type { Settings, SettingsUpdate } from '../types/settings';
import type { Business, BusinessAdd, BusinessUpdate } from './business';

declare global {
  interface Window {
    electronAPI: {
      ping: () => void;
      getAllSettings: () => Promise<Settings>;
      getAllBusinesses: (filter?: FilterType) => Promise<Business[]>;
      updateSettings: (data: SettingsUpdate) => Promise<{ success: boolean; message?: string }>;
      updateBusiness: (data: BusinessUpdate) => Promise<{ success: boolean; message?: string }>;
      deleteBusiness: (id: number) => Promise<{ success: boolean; message?: string }>;
      addBusiness: (data: BusinessAdd) => Promise<{ success: boolean; message?: string }>;
      addBatchBusiness: (data: BusinessAdd[]) => Promise<{ success: boolean; message?: string }>;
      openUrl: (url: string) => Promise<void>;
    };
  }
}

export {};
