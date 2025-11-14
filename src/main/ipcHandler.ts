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

const initIpcHandler = (db: Database, path: string) => {
  if (!db) throw new Error('Database not initialized');
  if (!path) throw new Error('Database path not set');

  const handleBusiness = async (data: Business, isUpdate = false) => {
    const fields = [
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
    ] as const satisfies readonly (keyof Business)[];

    const params = fields.map(key => (data[key] as string | number | null) ?? null);

    if (isUpdate) {
      const setClause = fields.map(f => `${f} = ?`).join(', ') + `, updatedAt = datetime('now','localtime')`;

      await runDb(db, `UPDATE businesses SET ${setClause} WHERE id = ?`, [...params, data.id ?? -1]);
    } else {
      await runDb(
        db,
        `INSERT INTO businesses (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`,
        params
      );
    }

    return { success: true };
  };

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

  ipcMain.handle('get-all-businesses', async () => {
    const sql = `
      SELECT 
        b.*, 
        COUNT(DISTINCT i.id) AS invoiceCount,
        COUNT(DISTINCT e.id) AS quotesCount
      FROM businesses b
      LEFT JOIN invoices i ON i.businessId = b.id
      LEFT JOIN quotes e ON e.businessId = b.id
      GROUP BY b.id
    `;
    const rows = await getAllRows(db, sql);

    return rows;
  });

  ipcMain.handle('delete-business', async (_event, id: number) => {
    await runDb(db, 'DELETE FROM businesses WHERE id = ?;', [id]);

    return { success: true };
  });

  ipcMain.handle('add-business', async (_event, data: Business) => await handleBusiness(data));

  ipcMain.handle('update-business', async (_event, data: Business) => await handleBusiness(data, true));

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

      fields.push(`updatedAt = datetime('now','localtime')`);
      await runDb(db, `UPDATE settings SET ${fields.join(', ')} WHERE id = (SELECT id FROM settings LIMIT 1)`, params);
      return { success: true };
    }
  );

  ipcMain.handle('open-url', async (_event, url: string) => {
    await shell.openExternal(url);
  });
};

export { initIpcHandler };
