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
  quatesCount: number;
  createdAt: string;
  updatedAt: string;
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
}

export interface BusinessUpdate extends BusinessAdd {
  id: number;
}

export interface CRBusinessFromData {
  id?: number;
  logo?: Blob;
  email?: string;
  phone?: string;
  name: string;
  shortName: string;
  role?: string;
  address?: string;
  website?: string;
  additional?: string;
  paymentInformation?: string;
}
