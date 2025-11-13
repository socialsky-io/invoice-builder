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
  estimateCount: number;
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
