import { CurrencyFormat } from '../enums/currencyFormat';
import type { BusinessFromData } from '../types/business';
import type { CategoryFromData } from '../types/category';
import type { ClientFromData } from '../types/client';
import type { CurrencyFromData } from '../types/currency';
import type { ItemFromData } from '../types/item';
import type { UnitFromData } from '../types/unit';
import { validators } from './validatorFunctions';

export const isBusinessFromData = (data: unknown): data is BusinessFromData => {
  if (typeof data !== 'object' || data === null) return false;

  const d = data as Record<string, unknown>;

  if (typeof d.name !== 'string') return false;
  if (typeof d.shortName !== 'string') return false;

  if (d.id !== undefined && d.id !== null && d.id !== '' && typeof d.id !== 'number') return false;

  if (d.isArchived !== undefined && d.isArchived !== null && d.isArchived !== '' && typeof d.isArchived !== 'boolean')
    return false;

  if (d.logo !== undefined && d.logo !== '' && d.logo != null) {
    // const isString = typeof d.logo === 'string';
    const isBlob = d.logo instanceof Uint8Array;

    // if (!isString && !isBlob) return false;
    if (!isBlob) return false;
  }

  if (d.email !== undefined && d.email !== null && d.email !== '') {
    if (typeof d.email !== 'string') return false;
    if (!validators.email(d.email)) return false;
  }
  if (d.phone !== undefined && d.phone !== null && d.phone !== '') {
    if (typeof d.phone !== 'string') return false;
    if (!validators.phone(d.phone)) return false;
  }
  if (
    d.description !== undefined &&
    d.description !== null &&
    d.description !== '' &&
    typeof d.description !== 'string'
  )
    return false;
  if (d.role !== undefined && d.role !== null && d.role !== '' && typeof d.role !== 'string') return false;
  if (d.address !== undefined && d.address !== null && d.address !== '' && typeof d.address !== 'string') return false;
  if (d.website !== undefined && d.website !== null && d.website !== '' && typeof d.website !== 'string') return false;
  if (d.additional !== undefined && d.additional !== null && d.additional !== '' && typeof d.additional !== 'string')
    return false;
  if (
    d.paymentInformation !== undefined &&
    d.paymentInformation !== null &&
    d.paymentInformation !== '' &&
    typeof d.paymentInformation !== 'string'
  )
    return false;

  return true;
};

export const isItemFromData = (data: unknown): data is ItemFromData => {
  if (typeof data !== 'object' || data === null) return false;

  const d = data as Record<string, unknown>;

  if (typeof d.name !== 'string') return false;

  if (d.id !== undefined && d.id !== null && d.id !== '' && typeof d.id !== 'number') return false;
  if (d.isArchived !== undefined && d.isArchived !== null && d.isArchived !== '' && typeof d.isArchived !== 'boolean')
    return false;

  if (d.amount !== undefined && d.amount !== null && d.amount !== '' && typeof d.amount !== 'string') return false;
  if (
    d.description !== undefined &&
    d.description !== null &&
    d.description !== '' &&
    typeof d.description !== 'string'
  )
    return false;

  if (d.unitID !== undefined && d.unitID !== null && d.unitID !== '' && typeof d.unitID !== 'number') return false;
  if (d.categoryID !== undefined && d.categoryID !== null && d.categoryID !== '' && typeof d.categoryID !== 'number')
    return false;

  if (
    d.categoryName !== undefined &&
    d.categoryName !== null &&
    d.categoryName !== '' &&
    typeof d.categoryName !== 'string'
  )
    return false;
  if (d.unitName !== undefined && d.unitName !== null && d.unitName !== '' && typeof d.unitName !== 'string')
    return false;

  return true;
};

export const isUnitFromData = (data: unknown): data is UnitFromData => {
  if (typeof data !== 'object' || data === null) return false;

  const d = data as Record<string, unknown>;

  if (typeof d.name !== 'string') return false;

  if (d.id !== undefined && d.id !== null && d.id !== '' && typeof d.id !== 'number') return false;
  if (d.isArchived !== undefined && d.isArchived !== null && d.isArchived !== '' && typeof d.isArchived !== 'boolean')
    return false;

  return true;
};

export const isCategoryFromData = (data: unknown): data is CategoryFromData => {
  if (typeof data !== 'object' || data === null) return false;

  const d = data as Record<string, unknown>;

  if (typeof d.name !== 'string') return false;

  if (d.id !== undefined && d.id !== null && d.id !== '' && typeof d.id !== 'number') return false;
  if (d.isArchived !== undefined && d.isArchived !== null && d.isArchived !== '' && typeof d.isArchived !== 'boolean')
    return false;

  return true;
};

export const isClientFromData = (data: unknown): data is ClientFromData => {
  if (typeof data !== 'object' || data === null) return false;

  const d = data as Record<string, unknown>;

  if (typeof d.name !== 'string') return false;
  if (typeof d.shortName !== 'string') return false;

  if (d.id !== undefined && d.id !== null && d.id !== '' && typeof d.id !== 'number') return false;
  if (d.isArchived !== undefined && d.isArchived !== null && d.isArchived !== '' && typeof d.isArchived !== 'boolean')
    return false;

  if (
    d.description !== undefined &&
    d.description !== null &&
    d.description !== '' &&
    typeof d.description !== 'string'
  )
    return false;
  if (d.email !== undefined && d.email !== null && d.email !== '') {
    if (typeof d.email !== 'string') return false;
    if (!validators.email(d.email)) return false;
  }
  if (d.phone !== undefined && d.phone !== null && d.phone !== '') {
    if (typeof d.phone !== 'string') return false;
    if (!validators.phone(d.phone)) return false;
  }
  if (d.address !== undefined && d.address !== null && d.address !== '' && typeof d.address !== 'string') return false;
  if (d.code !== undefined && d.code !== null && d.code !== '' && typeof d.code !== 'string') return false;
  if (d.additional !== undefined && d.additional !== null && d.additional !== '' && typeof d.additional !== 'string')
    return false;

  return true;
};

const currencyFormatValues = new Set<CurrencyFormat>(Object.values(CurrencyFormat));

const isValidCurrencyFormat = (value: unknown): value is CurrencyFormat => {
  return typeof value === 'string' && currencyFormatValues.has(value as CurrencyFormat);
};

export const isCurrencyFromData = (data: unknown): data is CurrencyFromData => {
  if (typeof data !== 'object' || data === null) return false;

  const d = data as Record<string, unknown>;

  if (d.isArchived !== undefined && d.isArchived !== null && d.isArchived !== '' && typeof d.isArchived !== 'boolean')
    return false;

  if (typeof d.subunit !== 'number') return false;
  if (typeof d.code !== 'string') return false;
  if (typeof d.symbol !== 'string') return false;
  if (typeof d.text !== 'string') return false;
  if (!isValidCurrencyFormat(d.format)) return false;

  if (d.id !== undefined && d.id !== null && d.id !== '' && typeof d.id !== 'number') return false;

  return true;
};
