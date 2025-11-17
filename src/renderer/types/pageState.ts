import type { Settings } from './settings';
import type { ToastMeta } from './toastMeta';

export interface PageState {
  isLoading: boolean;
  toasts: ToastMeta[];
  settings?: Settings;
}
