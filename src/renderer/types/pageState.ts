import type { BusinessModified } from './business';
import type { Category } from './category';
import type { Client } from './client';
import type { Currency } from './currency';
import type { Item } from './item';
import type { Settings } from './settings';
import type { ToastMeta } from './toastMeta';
import type { Unit } from './unit';

export interface PageState {
  isLoading: boolean;
  toasts: ToastMeta[];
  settings?: Settings;
  businesses: BusinessModified[];
  clients: Client[];
  items: Item[];
  currencies: Currency[];
  units: Unit[];
  category: Category[];
}
