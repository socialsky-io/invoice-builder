import { ipcMain } from 'electron';
import type { Database } from 'sqlite3';
import { runDb } from '../utils/dbFuntions';
import { getAllEntities, handleEntity } from '../utils/entitiesFunctions';
import { mapSqliteError } from '../utils/errorFunctions';
import type { Client } from './../types/client';

export const initClientsHandlers = (db: Database) => {
  const clientFields: (keyof Client)[] = [
    'name',
    'shortName',
    'address',
    'email',
    'phone',
    'code',
    'additional',
    'description',
    'isArchived'
  ];
  const handleClient = handleEntity<Client>(db, 'clients', clientFields);
  const getAllClients = getAllEntities(db, 'clients', 'clientId');

  ipcMain.handle('add-client', async (_e, data: Client) => handleClient(data));
  ipcMain.handle('update-client', async (_e, data: Client) => handleClient(data, true));
  ipcMain.handle('delete-client', async (_e, id: number) => {
    try {
      await runDb(db, 'DELETE FROM clients WHERE id = ?;', [id]);
      return { success: true };
    } catch (error) {
      return { success: false, ...mapSqliteError(error) };
    }
  });
  ipcMain.handle('batch-add-client', async (_e, data: Client[]) => {
    try {
      await runDb(db, 'BEGIN TRANSACTION');
      for (const row of data) {
        const result = await handleClient(row);
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
  ipcMain.handle('get-all-clients', async (_e, filter) => getAllClients(filter));
};
