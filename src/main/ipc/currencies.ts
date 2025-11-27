import { ipcMain } from 'electron';
import type { Database } from 'sqlite3';
import type { Currency } from '../types/currency';
import { runDb } from '../utils/dbFuntions';
import { getAllEntities, handleEntity } from '../utils/entitiesFunctions';
import { mapSqliteError } from '../utils/errorFunctions';

export const initCurrenciesHandlers = (db: Database) => {
  const currencyFields: (keyof Currency)[] = ['code', 'symbol', 'text', 'format', 'isArchived', 'subunit'];

  const handleCurrencies = handleEntity<Currency>(db, 'currencies', currencyFields);
  const getAllCurrencies = getAllEntities(db, 'currencies', 'currencyId');

  ipcMain.handle('add-currency', async (_event, data: Currency) => handleCurrencies(data));
  ipcMain.handle('update-currency', async (_event, data: Currency) => handleCurrencies(data, true));
  ipcMain.handle('delete-currency', async (_event, id: number) => {
    try {
      await runDb(db, 'DELETE FROM currencies WHERE id = ?;', [id]);
      return { success: true };
    } catch (error) {
      return { success: false, ...mapSqliteError(error) };
    }
  });
  ipcMain.handle('batch-add-currency', async (_event, data: Currency[]) => {
    try {
      await runDb(db, 'BEGIN TRANSACTION');
      for (const row of data) {
        const result = await handleCurrencies(row);
        if (!result.success) {
          await runDb(db, 'ROLLBACK');
          return result;
        }
      }
      await runDb(db, 'COMMIT');
      return { success: true };
    } catch (error) {
      await runDb(db, 'ROLLBACK');
      return { success: false, ...mapSqliteError(error) };
    }
  });
  ipcMain.handle('get-all-currencies', async (_event, filter) => getAllCurrencies(filter));
};
