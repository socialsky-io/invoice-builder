import { contextBridge, ipcRenderer } from 'electron';
import type { FilterType } from '../renderer/enums/filterType';
import type { BusinessAdd, BusinessUpdate } from '../renderer/types/business';
import type { ClientAdd, ClientUpdate } from '../renderer/types/client';
import type { SettingsUpdate } from '../renderer/types/settings';

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => console.log('pong'),

  openUrl: (url: string) => ipcRenderer.invoke('open-url', url),

  getAllSettings: () => ipcRenderer.invoke('get-all-settings'),
  updateSettings: (data: SettingsUpdate) => ipcRenderer.invoke('update-settings', data),

  getAllBusinesses: (filter?: FilterType) => ipcRenderer.invoke('get-all-businesses', filter),
  updateBusiness: (data: BusinessUpdate) => ipcRenderer.invoke('update-business', data),
  deleteBusiness: (id: number) => ipcRenderer.invoke('delete-business', id),
  addBusiness: (data: BusinessAdd) => ipcRenderer.invoke('add-business', data),
  addBatchBusiness: (data: BusinessAdd[]) => ipcRenderer.invoke('batch-add-business', data),

  getAllClients: (filter?: FilterType) => ipcRenderer.invoke('get-all-clients', filter),
  updateClient: (data: ClientUpdate) => ipcRenderer.invoke('update-client', data),
  deleteClient: (id: number) => ipcRenderer.invoke('delete-client', id),
  addClient: (data: ClientAdd) => ipcRenderer.invoke('add-client', data),
  addBatchClient: (data: ClientAdd[]) => ipcRenderer.invoke('batch-add-client', data)
});
