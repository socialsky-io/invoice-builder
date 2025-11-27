import { ipcMain, shell } from 'electron';
import type { Database } from 'sqlite3';
import { initBusinessesHandlers } from './businesses';
import { initCategoriesHandlers } from './categories';
import { initClientsHandlers } from './clients';
import { initCurrenciesHandlers } from './currencies';
import { initImportExportHandlers } from './importExport';
import { initInvoicesHandlers } from './invoices';
import { initItemsHandlers } from './items';
import { initSettingsHandlers } from './settings';
import { initUnitsHandlers } from './units';

export const initIpcHandler = (db: Database, path: string) => {
  if (!db) throw new Error('Database not initialized');
  if (!path) throw new Error('Database path not set');

  ipcMain.handle('open-url', async (_event, url: string) => {
    await shell.openExternal(url);
  });

  initBusinessesHandlers(db);
  initCategoriesHandlers(db);
  initClientsHandlers(db);
  initCurrenciesHandlers(db);
  initImportExportHandlers(db);
  initInvoicesHandlers(db);
  initItemsHandlers(db);
  initSettingsHandlers(db);
  initUnitsHandlers(db);
};
