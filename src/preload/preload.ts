import { contextBridge, ipcRenderer } from 'electron';
import type { BusinessAdd, BusinessUpdate } from '../renderer/types/business';
import type { SettingsUpdate } from '../renderer/types/settings';

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => console.log('pong'),
  getAllSettings: () => ipcRenderer.invoke('get-all-settings'),
  getAllBusinesses: () => ipcRenderer.invoke('get-all-businesses'),
  updateSettings: (data: SettingsUpdate) => ipcRenderer.invoke('update-settings', data),
  updateBusiness: (data: BusinessUpdate) => ipcRenderer.invoke('update-business', data),
  deleteBusiness: (id: number) => ipcRenderer.invoke('delete-business', id),
  addBusiness: (data: BusinessAdd) => ipcRenderer.invoke('add-business', data),
  openUrl: (url: string) => ipcRenderer.invoke('open-url', url)
});
