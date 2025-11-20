export interface Item {
  id: number;
  name: string;
  amount_cents?: number;
  amount?: number;
  unitId?: number;
  categoryId?: number;
  unitName?: string;
  categoryName?: string;
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
  categoryName?: string;
  unitName?: string;
}

export interface ItemUpdate extends ItemAdd {
  id: number;
}

export interface ItemFromData {
  id?: number;
  name: string;
  amount_cents?: number;
  amount?: number;
  unitId?: number;
  categoryId?: number;
  description?: string;
}
