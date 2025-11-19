import type { FilterType } from '../enums/filterType';

export interface RequestHook<T> {
  immediate?: boolean;
  showLoader?: boolean;
  filter?: FilterType;
  onDone?: (data: T) => void;
}
