import type { FilterType } from '../enums/filterType';
import type { CustomOption } from './customOption';

export interface FilterData {
  type: FilterType;
  value?: string;
}

type Options<T extends string | number | symbol> = CustomOption<T>[];
export interface Filter {
  value?: string;
  label: string;
  description?: string;
  initial?: boolean;
  isGroup?: boolean;
  type: FilterType;
  options?: Options<string | number | symbol>;
}
