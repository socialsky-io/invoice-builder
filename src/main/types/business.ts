export interface Business {
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
}
