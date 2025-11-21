import type { FilterType } from '../enums/filterType';

export interface Filter {
  label: string;
  description?: string;
  value: FilterType;
  initial?: boolean;
}
