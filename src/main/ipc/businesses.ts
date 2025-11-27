import { ipcMain } from 'electron';
import type { Database } from 'sqlite3';
import type { Business } from '../types/business';
import { runDb } from '../utils/dbFuntions';
import { getAllEntities, handleEntity } from '../utils/entitiesFunctions';
import { mapSqliteError } from '../utils/errorFunctions';

export const initBusinessesHandlers = (db: Database) => {
  const businessFields: (keyof Business)[] = [
    'name',
    'shortName',
    'address',
    'role',
    'email',
    'phone',
    'website',
    'additional',
    'paymentInformation',
    'logo',
    'fileSize',
    'fileType',
    'fileName',
    'description',
    'isArchived'
  ];
  const handleBusiness = handleEntity<Business>(db, 'businesses', businessFields);
  const getAllBusinesses = getAllEntities(db, 'businesses', 'businessId');

  ipcMain.handle('add-business', async (_event, data: Business) => handleBusiness(data));
  ipcMain.handle('update-business', async (_event, data: Business) => handleBusiness(data, true));
  ipcMain.handle('delete-business', async (_event, id: number) => {
    try {
      await runDb(db, 'DELETE FROM businesses WHERE id = ?;', [id]);
      return { success: true };
    } catch (error) {
      return { success: false, ...mapSqliteError(error) };
    }
  });
  ipcMain.handle('batch-add-business', async (_event, data: Business[]) => {
    try {
      await runDb(db, 'BEGIN TRANSACTION');
      for (const row of data) {
        const result = await handleBusiness(row);
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
  ipcMain.handle('get-all-businesses', async (_event, filter) => getAllBusinesses(filter));
};
