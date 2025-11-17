import type { FilterType } from '../enums/filterType';

export interface RequestHook {
  immediate?: boolean;
  showLoader?: boolean;
  filter?: FilterType;
  onDone?: () => void;
}
