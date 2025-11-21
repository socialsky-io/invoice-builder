export interface Item {
  id: number;
  name: string;
  amountCents?: number;
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
  isArchived: boolean;
}

export interface ItemAdd {
  name: string;
  amountCents?: number;
  unitId?: number;
  categoryId?: number;
  description?: string;
  categoryName?: string;
  unitName?: string;
  isArchived: boolean;
}

export interface ItemUpdate extends ItemAdd {
  id: number;
}

export interface ItemFromData {
  id?: number;
  name: string;
  amountCents?: number;
  amount?: number;
  unitId?: number;
  categoryId?: number;
  description?: string;
  isArchived: boolean;
}
