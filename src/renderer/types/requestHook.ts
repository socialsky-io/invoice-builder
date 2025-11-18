import type { FilterType } from '../enums/filterType';
import type { Response } from '../types/response';

export interface RequestHook {
  immediate?: boolean;
  showLoader?: boolean;
  filter?: FilterType;
  onDone?: (data: Response) => void;
}
