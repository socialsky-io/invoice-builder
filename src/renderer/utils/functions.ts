import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { TFunction } from 'i18next';
import { CurrencyFormat } from '../enums/currencyFormat';
import { SortType } from '../enums/sortType';
import type { BusinessFromData } from '../types/business';
import type { ClientFromData } from '../types/client';
import type { CurrencyFromData } from '../types/currency';
import type { Columns, Row, Rows, RowValue } from '../types/excel';
import { validators } from './validators';

export const validateOnlyNumbersLetters = (value: string) => {
  const isValid = /^[a-zA-Z0-9]*$/.test(value);
  return isValid;
};

export const toUint8Array = async (
  t: TFunction<'translation', undefined>,
  input: Blob | File | ArrayBuffer | Uint8Array | null
) => {
  if (!input) return null;

  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (input instanceof Blob) {
    const arrayBuffer = await input.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  throw new Error(t('error.unsupportedImage'));
};

export const fromUint8Array = (data?: Uint8Array | null, type = 'image/jpeg'): string | null => {
  if (!data) return null;

  const buffer =
    data.buffer instanceof ArrayBuffer
      ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
      : new ArrayBuffer(0);

  const blob = new Blob([buffer], { type });
  return URL.createObjectURL(blob);
};

export const filterAndSortArray = <T>(params: {
  data: T[];
  searchValue: string;
  searchField: keyof T;
  sortField?: keyof T;
  sortType: SortType;
}): T[] => {
  let { data, searchValue, searchField, sortField, sortType = SortType.DEFAULT } = params;

  let result = data;
  if (searchValue) {
    const lowerSearch = searchValue.toLowerCase();
    result = result.filter(item => {
      const value = item[searchField];
      return typeof value === 'string' && value.toLowerCase().includes(lowerSearch);
    });
  }

  if ((sortType === SortType.ASC || sortType === SortType.DESC) && sortField) {
    result = [...result].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortType === SortType.ASC ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortType === SortType.ASC ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }

  return result;
};

export const isBusinessFromData = (data: unknown): data is BusinessFromData => {
  if (typeof data !== 'object' || data === null) return false;

  const d = data as Record<string, unknown>;

  if (typeof d.name !== 'string') return false;
  if (typeof d.shortName !== 'string') return false;

  if (d.id !== undefined && typeof d.id !== 'number') return false;

  if (d.logo !== undefined && d.logo !== '' && d.logo != null) {
    // const isString = typeof d.logo === 'string';
    const isBlob = d.logo instanceof Blob;

    // if (!isString && !isBlob) return false;
    if (!isBlob) return false;
  }

  if (d.email !== undefined) {
    if (typeof d.email !== 'string') return false;
    if (d.email !== '' && !validators.email(d.email)) return false;
  }
  if (d.phone !== undefined) {
    if (typeof d.phone !== 'string') return false;
    if (d.phone !== '' && !validators.phone(d.phone)) return false;
  }
  if (d.role !== undefined && typeof d.role !== 'string') return false;
  if (d.address !== undefined && typeof d.address !== 'string') return false;
  if (d.website !== undefined && typeof d.website !== 'string') return false;
  if (d.additional !== undefined && typeof d.additional !== 'string') return false;
  if (d.paymentInformation !== undefined && typeof d.paymentInformation !== 'string') return false;

  return true;
};

export const isClientFromData = (data: unknown): data is ClientFromData => {
  if (typeof data !== 'object' || data === null) return false;

  const d = data as Record<string, unknown>;

  if (typeof d.name !== 'string') return false;
  if (typeof d.shortName !== 'string') return false;

  if (d.id !== undefined && typeof d.id !== 'number') return false;

  if (d.email !== undefined) {
    if (typeof d.email !== 'string') return false;
    if (d.email !== '' && !validators.email(d.email)) return false;
  }
  if (d.phone !== undefined) {
    if (typeof d.phone !== 'string') return false;
    if (d.phone !== '' && !validators.phone(d.phone)) return false;
  }
  if (d.address !== undefined && typeof d.address !== 'string') return false;
  if (d.code !== undefined && typeof d.code !== 'string') return false;
  if (d.additional !== undefined && typeof d.additional !== 'string') return false;

  return true;
};

const currencyFormatValues = new Set<CurrencyFormat>(Object.values(CurrencyFormat));

const isValidCurrencyFormat = (value: unknown): value is CurrencyFormat => {
  return typeof value === 'string' && currencyFormatValues.has(value as CurrencyFormat);
};

export const isCurrencyFromData = (data: unknown): data is CurrencyFromData => {
  if (typeof data !== 'object' || data === null) return false;

  const d = data as Record<string, unknown>;

  if (typeof d.code !== 'string') return false;
  if (typeof d.symbol !== 'string') return false;
  if (typeof d.text !== 'string') return false;
  if (!isValidCurrencyFormat(d.format)) return false;

  if (d.id !== undefined && typeof d.id !== 'number') return false;

  return true;
};

// Leaving logos column out of excel
// export const dataUrlToBlob = (dataUrl: string): Blob => {
//   try {
//     const base64Index = dataUrl.indexOf(',') + 1;
//     const base64 = dataUrl.slice(base64Index);
//     const mimeTypeMatch = dataUrl.match(/^data:(.*?);base64,/);
//     const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'application/octet-stream';

//     const byteCharacters = atob(base64);
//     const byteNumbers = new Array(byteCharacters.length);
//     for (let i = 0; i < byteCharacters.length; i++) {
//       byteNumbers[i] = byteCharacters.charCodeAt(i);
//     }
//     const byteArray = new Uint8Array(byteNumbers);
//     return new Blob([byteArray], { type: mimeType });
//   } catch (error) {
//     throw new Error(t("error.invalidLogo"));
//   }
// };

export const isDataUrl = (value: unknown): value is string => {
  return typeof value === 'string' && /^data:[\w/+.-]+;base64,[A-Za-z0-9+/=]+$/.test(value);
};

export const uint8ArrayToDataUrl = (data: Uint8Array, mimeType = 'image/jpeg'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const buffer = new Uint8Array(data).buffer;
    const blob = new Blob([buffer], { type: mimeType });
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Failed to convert'));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const exportExcel = async (columns: Columns, rows: Rows, fileName = 'export.xlsx') => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sheet1');

  sheet.addRow(columns);

  for (const row of rows) {
    const processedRow: RowValue[] = [];

    for (const col of columns) {
      const value = row[col];

      if (value instanceof Uint8Array) {
        processedRow.push(await uint8ArrayToDataUrl(value));
      } else {
        processedRow.push(value);
      }
    }

    sheet.addRow(processedRow);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), fileName);
};

export const importExcel = async (
  t: TFunction<'translation', undefined>,
  file: File
): Promise<{ columns: Columns; rows: Rows }> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());

  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error(t('error.noWorksheetFound'));

  const headerRow = sheet.getRow(1);
  if (!headerRow || !headerRow.hasValues) {
    throw new Error(t('error.headerRowEmpty'));
  }

  const headerValuesArray = Array.isArray(headerRow.values) ? headerRow.values : Object.values(headerRow.values);
  const columns: Columns = headerValuesArray.slice(1).map(v => String(v ?? ''));

  const rows: Rows = [];

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const rowData: Row = {} as Row;
    columns.forEach((col, i) => {
      const cellValue = row.getCell(i + 1).value as RowValue;

      // Leaving logos column out of excel
      // if (isDataUrl(cellValue)) {
      //   rowData[col] = dataUrlToBlob(cellValue);
      // } else {
      //   rowData[col] = cellValue;
      // }

      rowData[col] = cellValue;
    });
    rows.push(rowData);
  });

  return { columns, rows };
};

export const getFormattedLabel = (data: { label: string; symbol: string; code: string }) => {
  return data.label.replace('{symbol}', data.symbol || '').replace('{code}', data.code || '');
};
