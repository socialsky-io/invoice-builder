import type { BusinessModified } from './business';
import type { Client } from './client';
import type { Settings } from './settings';
import type { ToastMeta } from './toastMeta';

export interface PageState {
  isLoading: boolean;
  toasts: ToastMeta[];
  settings?: Settings;
  businesses: BusinessModified[];
  clients: Client[];
}
