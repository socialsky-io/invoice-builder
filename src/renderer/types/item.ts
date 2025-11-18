export interface Item {
  id: number;
  name: string;
  amount_cents?: number;
  unitId?: number;
  categoryId?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  invoiceCount: number;
  quotesCount: number;
}

export interface ItemAdd {
  name: string;
  amount_cents?: number;
  unitId?: number;
  categoryId?: number;
  description?: string;
}

export interface ItemUpdate extends ItemAdd {
  id: number;
}

export interface ItemFromData {
  id?: number;
  name: string;
  amount_cents?: number;
  unitId?: number;
  categoryId?: number;
  description?: string;
}
