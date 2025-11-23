export interface Item {
  id?: number;
  name: string;
  unitId?: number;
  amount?: number;
  categoryId?: number;
  categoryName?: string;
  unitName?: string;
  description?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}
