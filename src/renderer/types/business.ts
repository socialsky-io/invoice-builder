export interface Business {
  id: number;
  name: string;
  shortName: string;
  address?: string;
  role?: string;
  email?: string;
  phone?: string;
  website?: string;
  additional?: string;
  paymentInformation?: string;
  logo?: Uint8Array | null;
  invoiceCount: number;
  quotesCount: number;
  createdAt: string;
  updatedAt: string;
  file_size?: number;
  file_type?: string;
}

export interface BusinessModified {
  id: number;
  name: string;
  shortName: string;
  address?: string;
  role?: string;
  email?: string;
  phone?: string;
  website?: string;
  additional?: string;
  paymentInformation?: string;
  logo?: string | null;
  invoiceCount: number;
  quotesCount: number;
  createdAt: string;
  updatedAt: string;
  file_size?: number;
  file_type?: string;
}

export interface BusinessAdd {
  name: string;
  shortName: string;
  address?: string;
  role?: string;
  email?: string;
  phone?: string;
  website?: string;
  additional?: string;
  paymentInformation?: string;
  logo?: Uint8Array | null;
  file_size?: number;
  file_type?: string;
}

export interface BusinessUpdate extends BusinessAdd {
  id: number;
}

export interface BusinessFromData {
  id?: number;
  logo?: Uint8Array;
  email?: string;
  phone?: string;
  name: string;
  shortName: string;
  role?: string;
  address?: string;
  website?: string;
  additional?: string;
  paymentInformation?: string;
  file_size?: number;
  file_type?: string;
}
