export const validateOnlyNumbersLetters = (value: string) => {
  const isValid = /^[a-zA-Z0-9]*$/.test(value);
  return isValid;
};

export const toUint8Array = async (input: Blob | File | ArrayBuffer | Uint8Array | null) => {
  if (!input) return null;

  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (input instanceof Blob) {
    const arrayBuffer = await input.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  throw new Error('Unsupported image type');
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

import { SortType } from '../enums/sortType';
import type { CRBusinessFromData } from '../types/business';

export const filterAndSortArray = <T>(
  data: T[],
  searchValue: string,
  searchField: keyof T,
  sortField?: keyof T,
  sortType: SortType = SortType.DEFAULT
): T[] => {
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

export const isCRBusinessFromData = (data: unknown): data is CRBusinessFromData => {
  if (typeof data !== 'object' || data === null) return false;

  const d = data as Record<string, unknown>;

  if (typeof d.name !== 'string') return false;
  if (typeof d.shortName !== 'string') return false;

  if (d.id !== undefined && typeof d.id !== 'number') return false;
  if (d.logo !== undefined && !(d.logo instanceof Blob)) return false;
  if (d.email !== undefined && typeof d.email !== 'string') return false;
  if (d.phone !== undefined && typeof d.phone !== 'string') return false;
  if (d.role !== undefined && typeof d.role !== 'string') return false;
  if (d.address !== undefined && typeof d.address !== 'string') return false;
  if (d.website !== undefined && typeof d.website !== 'string') return false;
  if (d.additional !== undefined && typeof d.additional !== 'string') return false;
  if (d.paymentInformation !== undefined && typeof d.paymentInformation !== 'string') return false;

  return true;
};
