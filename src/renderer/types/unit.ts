export interface Unit {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  invoiceCount: number;
  quotesCount: number;
}

export interface UnitAdd {
  name: string;
}

export interface UnitUpdate extends UnitAdd {
  id: number;
}

export interface UnitFromData {
  id?: number;
  name: string;
}
