export type ColumnName = string;
export type Columns = ColumnName[];
export type RowValue = string | number | boolean | null | Blob | Date | undefined;
export type Row = Record<ColumnName, RowValue>;
export type Rows = Row[];
