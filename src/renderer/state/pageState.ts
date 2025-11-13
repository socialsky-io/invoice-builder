import type { Settings } from '../types/settings';
import type { ToastMeta } from '../types/toastMeta';

export interface PageState {
  isLoading: boolean;
  toasts: ToastMeta[];
  settings?: Settings;
}
