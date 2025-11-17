import type { Business } from './business';
import type { Settings } from './settings';
import type { ToastMeta } from './toastMeta';

export interface PageState {
  isLoading: boolean;
  toasts: ToastMeta[];
  settings?: Settings;
  businesses: Business[];
}
