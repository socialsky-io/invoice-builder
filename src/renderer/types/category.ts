export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  invoiceCount: number;
  quotesCount: number;
}

export interface CategoryAdd {
  name: string;
}

export interface CategoryUpdate extends CategoryAdd {
  id: number;
}

export interface CategoryFromData {
  id?: number;
  name: string;
}
