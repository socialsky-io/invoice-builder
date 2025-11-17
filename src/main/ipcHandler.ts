import { ipcMain, shell } from 'electron';
import type { Database } from 'sqlite3';
import { getAllRows, getFirstRow, runDb, type SqliteValue } from './functions';

interface UpdateData {
  [key: string]: SqliteValue;
}

interface Business {
  id?: number;
  logo?: Uint8Array;
  email?: string;
  phone?: string;
  name: string;
  shortName: string;
  role?: string;
  address?: string;
  website?: string;
  additional?: string;
  paymentInformation?: string;
}

interface Client {
  id?: number;
  email?: string;
  phone?: string;
  name: string;
  shortName: string;
  address?: string;
  additional?: string;
  code?: string;
}

type EntityWithId = { id?: number };

const prepareUpdate = (data: UpdateData, id?: number) => {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = ?`);

      let param: string | number | null;

      if (typeof value === 'boolean') param = value ? 1 : 0;
      else if (value === null) param = null;
      else if (typeof value === 'string' || typeof value === 'number') param = value;
      else throw new Error(`Unsupported value type for key "${key}"`);

      params.push(param);
    }
  });

  if (id != null) params.push(id);

  return { fields, params };
};

const getAllEntities =
  <T extends Record<string, unknown>>(db: Database, table: string, keyFieldName: string) =>
  async (filter: 'All' | 'AtleastOneInvoice' | 'NoInvoices' | 'NoInvoices30' | 'NoInvoices60' | 'NoInvoices90') => {
    let whereClause = '';
    switch (filter) {
      case 'NoInvoices30':
        whereClause = `HAVING MAX(i.updatedAt) IS NULL OR MAX(i.updatedAt) < datetime('now', '-30 days')`;
        break;
      case 'NoInvoices60':
        whereClause = `HAVING MAX(i.updatedAt) IS NULL OR MAX(i.updatedAt) < datetime('now', '-60 days')`;
        break;
      case 'NoInvoices90':
        whereClause = `HAVING MAX(i.updatedAt) IS NULL OR MAX(i.updatedAt) < datetime('now', '-90 days')`;
        break;
      case 'NoInvoices':
        whereClause = `HAVING COUNT(i.id) = 0`;
        break;
      case 'AtleastOneInvoice':
        whereClause = `HAVING COUNT(i.id) > 0`;
        break;
    }

    const sql = `
    SELECT 
      t.*,
      COUNT(DISTINCT i.id) AS invoiceCount,
      COUNT(DISTINCT q.id) AS quotesCount
    FROM ${table} t
    LEFT JOIN invoices i ON i.${keyFieldName} = t.id
    LEFT JOIN quotes q ON q.${keyFieldName} = t.id
    GROUP BY t.id
    ${whereClause}
  `;

    return getAllRows<T & { invoiceCount: number; quotesCount: number }>(db, sql);
  };

const handleEntity =
  <T extends EntityWithId>(db: Database, table: string, fields: readonly (keyof T)[]) =>
  async (data: T, isUpdate = false) => {
    const params = fields.map(key => (data[key] ?? null) as string | number | null);

    if (isUpdate) {
      const setClause = fields.map(f => `${String(f)} = ?`).join(', ') + `, updatedAt = datetime('now','localtime')`;

      await runDb(db, `UPDATE ${table} SET ${setClause} WHERE id = ?`, [...params, data.id ?? -1]);
    } else {
      await runDb(
        db,
        `INSERT INTO ${table} (${fields.map(f => String(f)).join(',')}) VALUES (${fields.map(() => '?').join(',')})`,
        params
      );
    }

    return { success: true };
  };

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
  'logo'
];

const clientFields: (keyof Client)[] = ['name', 'shortName', 'address', 'email', 'phone', 'code', 'additional'];

const initIpcHandler = (db: Database, path: string) => {
  if (!db) throw new Error('Database not initialized');
  if (!path) throw new Error('Database path not set');

  const handleBusiness = handleEntity<Business>(db, 'businesses', businessFields);
  const handleClient = handleEntity<Client>(db, 'clients', clientFields);
  const getAllBusinesses = getAllEntities(db, 'businesses', 'businessId');
  const getAllClients = getAllEntities(db, 'clients', 'cliendId');

  ipcMain.handle('open-url', async (_event, url: string) => {
    await shell.openExternal(url);
  });

  ipcMain.handle('get-all-settings', async () => {
    const row = await getFirstRow(db, 'SELECT * FROM settings LIMIT 1');
    if (!row) return null;
    return {
      ...row,
      isDarkMode: row.isDarkMode === 1,
      shouldIncludeYear: row.shouldIncludeYear === 1,
      shouldIncludeMonth: row.shouldIncludeMonth === 1,
      shouldIncludeBusinessName: row.shouldIncludeBusinessName === 1,
      quotesON: row.quotesON === 1,
      reportsON: row.reportsON === 1,
      overviewCardsON: row.overviewCardsON === 1
    };
  });

  ipcMain.handle(
    'update-settings',
    async (
      _event,
      data: {
        language?: string;
        amountFormat?: string;
        dateFormat?: string;
        isDarkMode?: boolean;
        invoicePrefix?: string;
        invoiceSuffix?: string;
        shouldIncludeYear?: boolean;
        shouldIncludeMonth?: boolean;
        shouldIncludeBusinessName?: boolean;
        quotesON?: boolean;
        reportsON?: boolean;
        overviewCardsON?: boolean;
      }
    ) => {
      const { fields, params } = prepareUpdate(data);
      if (!fields.length) return { success: true };

      fields.push(`updatedAt = datetime('now')`);
      await runDb(db, `UPDATE settings SET ${fields.join(', ')} WHERE id = (SELECT id FROM settings LIMIT 1)`, params);
      return { success: true };
    }
  );

  ipcMain.handle('add-client', async (_event, data: Client) => handleClient(data));
  ipcMain.handle('update-client', async (_event, data: Client) => handleClient(data, true));
  ipcMain.handle('delete-client', async (_event, id: number) => {
    await runDb(db, 'DELETE FROM clients WHERE id = ?;', [id]);
    return { success: true };
  });
  ipcMain.handle('batch-add-client', async (_event, data: Client[]) => {
    for (const row of data) {
      const result = await handleClient(row);
      if (!result.success) return result;
    }
    return { success: true };
  });
  ipcMain.handle('get-all-clients', async (_event, filter) => getAllClients(filter));

  ipcMain.handle('add-business', async (_event, data: Business) => handleBusiness(data));
  ipcMain.handle('update-business', async (_event, data: Business) => handleBusiness(data, true));
  ipcMain.handle('delete-business', async (_event, id: number) => {
    await runDb(db, 'DELETE FROM businesses WHERE id = ?;', [id]);
    return { success: true };
  });
  ipcMain.handle('batch-add-business', async (_event, data: Business[]) => {
    for (const row of data) {
      const result = await handleBusiness(row);
      if (!result.success) return result;
    }
    return { success: true };
  });
  ipcMain.handle('get-all-businesses', async (_event, filter) => getAllBusinesses(filter));
};

export { initIpcHandler };
