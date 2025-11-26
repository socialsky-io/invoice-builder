import { contextBridge, ipcRenderer } from 'electron';
import type { InvoiceType } from '../main/enums/invoiceType';
import type { DBInitType } from '../renderer/shared/enums/dbInitType';
import type { BusinessAdd, BusinessUpdate } from '../renderer/shared/types/business';
import type { CategoryAdd, CategoryUpdate } from '../renderer/shared/types/category';
import type { ClientAdd, ClientUpdate } from '../renderer/shared/types/client';
import type { CurrencyAdd, CurrencyUpdate } from '../renderer/shared/types/currency';
import type { FilterData } from '../renderer/shared/types/filter';
import type { InvoiceAdd, InvoiceUpdate } from '../renderer/shared/types/invoice';
import type { ItemAdd, ItemUpdate } from '../renderer/shared/types/item';
import type { SettingsUpdate } from '../renderer/shared/types/settings';
import type { UnitAdd, UnitUpdate } from '../renderer/shared/types/unit';

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => console.log('pong'),

  selectDatabase: () => ipcRenderer.invoke('show-save-db-dialog'),
  openDatabase: () => ipcRenderer.invoke('show-open-db-dialog'),
  initializeDatabase: (data: { fullPath: string; mode?: DBInitType }) => ipcRenderer.invoke('initialize-db', data),

  openUrl: (url: string) => ipcRenderer.invoke('open-url', url),

  getAllSettings: () => ipcRenderer.invoke('get-all-settings'),
  updateSettings: (data: SettingsUpdate) => ipcRenderer.invoke('update-settings', data),

  getAllBusinesses: (filter?: FilterData[]) => ipcRenderer.invoke('get-all-businesses', filter),
  updateBusiness: (data: BusinessUpdate) => ipcRenderer.invoke('update-business', data),
  deleteBusiness: (id: number) => ipcRenderer.invoke('delete-business', id),
  addBusiness: (data: BusinessAdd) => ipcRenderer.invoke('add-business', data),
  addBatchBusiness: (data: BusinessAdd[]) => ipcRenderer.invoke('batch-add-business', data),

  getAllClients: (filter?: FilterData[]) => ipcRenderer.invoke('get-all-clients', filter),
  updateClient: (data: ClientUpdate) => ipcRenderer.invoke('update-client', data),
  deleteClient: (id: number) => ipcRenderer.invoke('delete-client', id),
  addClient: (data: ClientAdd) => ipcRenderer.invoke('add-client', data),
  addBatchClient: (data: ClientAdd[]) => ipcRenderer.invoke('batch-add-client', data),

  getAllItems: (filter?: FilterData[]) => ipcRenderer.invoke('get-all-items', filter),
  updateItem: (data: ItemUpdate) => ipcRenderer.invoke('update-item', data),
  deleteItem: (id: number) => ipcRenderer.invoke('delete-item', id),
  addItem: (data: ItemAdd) => ipcRenderer.invoke('add-item', data),
  addBatchItem: (data: ItemAdd[]) => ipcRenderer.invoke('batch-add-item', data),

  getAllUnits: (filter?: FilterData[]) => ipcRenderer.invoke('get-all-units', filter),
  updateUnit: (data: UnitUpdate) => ipcRenderer.invoke('update-unit', data),
  deleteUnit: (id: number) => ipcRenderer.invoke('delete-unit', id),
  addUnit: (data: UnitAdd) => ipcRenderer.invoke('add-unit', data),
  addBatchUnit: (data: UnitAdd[]) => ipcRenderer.invoke('batch-add-unit', data),

  getAllCategories: (filter?: FilterData[]) => ipcRenderer.invoke('get-all-categories', filter),
  updateCategory: (data: CategoryUpdate) => ipcRenderer.invoke('update-category', data),
  deleteCategory: (id: number) => ipcRenderer.invoke('delete-category', id),
  addCategory: (data: CategoryAdd) => ipcRenderer.invoke('add-category', data),
  addBatchCategory: (data: CategoryAdd[]) => ipcRenderer.invoke('batch-add-category', data),

  getAllCurrencies: (filter?: FilterData[]) => ipcRenderer.invoke('get-all-currencies', filter),
  updateCurrency: (data: CurrencyUpdate) => ipcRenderer.invoke('update-currency', data),
  deleteCurrency: (id: number) => ipcRenderer.invoke('delete-currency', id),
  addCurrency: (data: CurrencyAdd) => ipcRenderer.invoke('add-currency', data),
  addBatchCurrency: (data: CurrencyAdd[]) => ipcRenderer.invoke('batch-add-currency', data),

  getAllInvoices: (type: InvoiceType, filter?: FilterData[]) => ipcRenderer.invoke('get-all-invoices', type, filter),
  deleteInvoice: (id: number) => ipcRenderer.invoke('delete-invoice', id),
  updateInvoice: (data: InvoiceUpdate) => ipcRenderer.invoke('update-invoice', data),
  addInvoice: (data: InvoiceAdd) => ipcRenderer.invoke('add-invoice', data),

  exportAllData: () => ipcRenderer.invoke('export-all-data'),
  importAllData: () => ipcRenderer.invoke('import-all-data')
});
