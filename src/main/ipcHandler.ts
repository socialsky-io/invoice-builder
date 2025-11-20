import { dialog, ipcMain, shell } from 'electron';
import { join } from 'path';
import type { Database } from 'sqlite3';
import { setupDB } from './database';
import { getAllRows, getFirstRow, runDb } from './functions';
import type { Business } from './types/business';
import type { Category } from './types/category';
import type { Client } from './types/client';
import type { Currency } from './types/currency';
import type { EntityWithId } from './types/entityWithId';
import type { Item } from './types/item';
import type { Unit } from './types/unit';
import type { UpdateData } from './types/updateData';

interface SqliteError extends Error {
  code: string;
}

const isSqliteError = (error: unknown): error is SqliteError => {
  return error instanceof Error && 'code' in error && typeof (error as Record<string, unknown>).code === 'string';
};

const mapSqliteError = (error: unknown): { message?: string; key?: string } => {
  if (isSqliteError(error)) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return { key: 'error.invalidConstraint' };
    }
    return { message: error.message };
  }
  return { key: 'error.invalidConstraint' };
};

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

const getHavingClause = (
  filter: 'All' | 'AtleastOneInvoice' | 'NoInvoices' | 'NoInvoices30' | 'NoInvoices60' | 'NoInvoices90',
  invoiceColumn = 'i.updatedAt',
  invoiceIdColumn = 'i.id'
) => {
  switch (filter) {
    case 'NoInvoices30':
      return `HAVING MAX(${invoiceColumn}) IS NULL OR MAX(${invoiceColumn}) < datetime('now', '-30 days')`;
    case 'NoInvoices60':
      return `HAVING MAX(${invoiceColumn}) IS NULL OR MAX(${invoiceColumn}) < datetime('now', '-60 days')`;
    case 'NoInvoices90':
      return `HAVING MAX(${invoiceColumn}) IS NULL OR MAX(${invoiceColumn}) < datetime('now', '-90 days')`;
    case 'NoInvoices':
      return `HAVING COUNT(${invoiceIdColumn}) = 0`;
    case 'AtleastOneInvoice':
      return `HAVING COUNT(${invoiceIdColumn}) > 0`;
    case 'All':
    default:
      return '';
  }
};

const getAllEntities =
  <T extends Record<string, unknown>>(db: Database, table: string, keyFieldName: string) =>
  async (filter: 'All' | 'AtleastOneInvoice' | 'NoInvoices' | 'NoInvoices30' | 'NoInvoices60' | 'NoInvoices90') => {
    const havingClause = getHavingClause(filter, 'i.updatedAt', 'i.id');

    const sql = `
    SELECT 
      t.*,
      COUNT(DISTINCT i.id) AS invoiceCount,
      COUNT(DISTINCT q.id) AS quotesCount
    FROM ${table} t
    LEFT JOIN invoices i ON i.${keyFieldName} = t.id
    LEFT JOIN quotes q ON q.${keyFieldName} = t.id
    GROUP BY t.id
    ${havingClause}
  `;

    const data = await getAllRows<T & { invoiceCount: number; quotesCount: number }>(db, sql);

    return {
      success: true,
      data: data
    };
  };

const handleEntity =
  <T extends EntityWithId>(db: Database, table: string, fields: readonly (keyof T)[]) =>
  async (data: T, isUpdate = false) => {
    const params = fields.map(key => (data[key] ?? null) as string | number | null);

    try {
      if (isUpdate) {
        const setClause = fields.map(f => `${String(f)} = ?`).join(', ') + `, updatedAt = datetime('now')`;

        await runDb(db, `UPDATE ${table} SET ${setClause} WHERE id = ?`, [...params, data.id ?? -1]);
      } else {
        await runDb(
          db,
          `INSERT INTO ${table} (${fields.map(f => String(f)).join(',')}) VALUES (${fields.map(() => '?').join(',')})`,
          params
        );
      }

      return { success: true };
    } catch (error) {
      return { success: false, ...mapSqliteError(error) };
    }
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
  'logo',
  'file_size',
  'file_type'
];
const clientFields: (keyof Client)[] = ['name', 'shortName', 'address', 'email', 'phone', 'code', 'additional'];
const itemFields: (keyof Item)[] = ['name', 'amount_cents', 'unitId', 'categoryId', 'description'];
const currencyFields: (keyof Currency)[] = ['code', 'symbol', 'text', 'format'];
const unitFields: (keyof Unit)[] = ['name'];
const categoryFields: (keyof Category)[] = ['name'];

const initIpcHandler = (db: Database, path: string) => {
  if (!db) throw new Error('Database not initialized');
  if (!path) throw new Error('Database path not set');

  const handleBusiness = handleEntity<Business>(db, 'businesses', businessFields);
  const handleClient = handleEntity<Client>(db, 'clients', clientFields);
  const handleItems = handleEntity<Item>(db, 'items', itemFields);
  const handleUnits = handleEntity<Unit>(db, 'units', unitFields);
  const handleCategories = handleEntity<Category>(db, 'categories', categoryFields);
  const handleCurrencies = handleEntity<Currency>(db, 'currencies', currencyFields);
  const getAllBusinesses = getAllEntities(db, 'businesses', 'businessId');
  const getAllClients = getAllEntities(db, 'clients', 'cliendId');
  const getAllCurrencies = getAllEntities(db, 'currencies', 'currencyId');

  ipcMain.handle('open-url', async (_event, url: string) => {
    await shell.openExternal(url);
  });

  ipcMain.handle('get-all-settings', async () => {
    const row = await getFirstRow(db, 'SELECT * FROM settings LIMIT 1');
    if (!row) return null;
    return {
      success: true,
      data: {
        ...row,
        isDarkMode: row.isDarkMode === 1,
        shouldIncludeYear: row.shouldIncludeYear === 1,
        shouldIncludeMonth: row.shouldIncludeMonth === 1,
        shouldIncludeBusinessName: row.shouldIncludeBusinessName === 1,
        quotesON: row.quotesON === 1,
        reportsON: row.reportsON === 1,
        overviewCardsON: row.overviewCardsON === 1
      }
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
      try {
        const { fields, params } = prepareUpdate(data);
        if (!fields.length) return { success: true };

        fields.push(`updatedAt = datetime('now')`);
        await runDb(
          db,
          `UPDATE settings SET ${fields.join(', ')} WHERE id = (SELECT id FROM settings LIMIT 1)`,
          params
        );
        return { success: true };
      } catch (error) {
        return { success: false, ...mapSqliteError(error) };
      }
    }
  );

  ipcMain.handle('add-client', async (_event, data: Client) => handleClient(data));
  ipcMain.handle('update-client', async (_event, data: Client) => handleClient(data, true));
  ipcMain.handle('delete-client', async (_event, id: number) => {
    try {
      await runDb(db, 'DELETE FROM clients WHERE id = ?;', [id]);
      return { success: true };
    } catch (error) {
      return { success: false, ...mapSqliteError(error) };
    }
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
    try {
      await runDb(db, 'DELETE FROM businesses WHERE id = ?;', [id]);
      return { success: true };
    } catch (error) {
      return { success: false, ...mapSqliteError(error) };
    }
  });
  ipcMain.handle('batch-add-business', async (_event, data: Business[]) => {
    for (const row of data) {
      const result = await handleBusiness(row);
      if (!result.success) return result;
    }
    return { success: true };
  });
  ipcMain.handle('get-all-businesses', async (_event, filter) => getAllBusinesses(filter));

  ipcMain.handle('add-item', async (_event, data: Item) => handleItems(data));
  ipcMain.handle('update-item', async (_event, data: Item) => handleItems(data, true));
  ipcMain.handle('delete-item', async (_event, id: number) => {
    try {
      await runDb(db, 'DELETE FROM items WHERE id = ?;', [id]);
      return { success: true };
    } catch (error) {
      return { success: false, ...mapSqliteError(error) };
    }
  });
  ipcMain.handle('batch-add-item', async (_event, data: Item[]) => {
    for (const row of data) {
      const result = await handleItems(row);
      if (!result.success) return result;
    }
    return { success: true };
  });
  ipcMain.handle('get-all-items', async (_event, filter) => {
    const havingClause = getHavingClause(filter, 'ii.updatedAt', 'ii.invoiceId');

    const sql = `
      SELECT 
        it.*,
        COUNT(DISTINCT ii.invoiceId) AS invoiceCount,
        COUNT(DISTINCT qi.quoteId) AS quotesCount
      FROM items it
      LEFT JOIN invoice_items ii ON ii.itemId = it.id
      LEFT JOIN quote_items qi ON qi.itemId = it.id
      GROUP BY it.id
      ${havingClause}
    `;
    return {
      success: true,
      data: await getAllRows(db, sql)
    };
  });

  ipcMain.handle('add-unit', async (_event, data: Unit) => handleUnits(data));
  ipcMain.handle('update-unit', async (_event, data: Unit) => handleUnits(data, true));
  ipcMain.handle('delete-unit', async (_event, id: number) => {
    try {
      await runDb(db, 'DELETE FROM units WHERE id = ?;', [id]);
      return { success: true };
    } catch (error) {
      return { success: false, ...mapSqliteError(error) };
    }
  });
  ipcMain.handle('batch-add-unit', async (_event, data: Unit[]) => {
    for (const row of data) {
      const result = await handleUnits(row);
      if (!result.success) return result;
    }
    return { success: true };
  });
  ipcMain.handle('get-all-units', async (_event, filter) => {
    const havingClause = getHavingClause(filter, 'i.updatedAt', 'i.id');

    const sql = `
      SELECT
        u.*,
        COUNT(DISTINCT ii.invoiceId) AS invoiceCount,
        COUNT(DISTINCT qi.quoteId) AS quotesCount
      FROM units u
      LEFT JOIN items it ON it.unitId = u.id
      LEFT JOIN invoice_items ii ON ii.itemId = it.id
      LEFT JOIN quote_items qi ON qi.itemId = it.id
      LEFT JOIN invoices i ON i.id = ii.invoiceId
      LEFT JOIN quotes q ON q.id = qi.quoteId
      GROUP BY u.id
      ${havingClause}
    `;
    return {
      success: true,
      data: await getAllRows(db, sql)
    };
  });

  ipcMain.handle('add-category', async (_event, data: Category) => handleCategories(data));
  ipcMain.handle('update-category', async (_event, data: Category) => handleCategories(data, true));
  ipcMain.handle('delete-category', async (_event, id: number) => {
    try {
      await runDb(db, 'DELETE FROM categories WHERE id = ?;', [id]);
      return { success: true };
    } catch (error) {
      return { success: false, ...mapSqliteError(error) };
    }
  });
  ipcMain.handle('batch-add-category', async (_event, data: Category[]) => {
    for (const row of data) {
      const result = await handleCategories(row);
      if (!result.success) return result;
    }
    return { success: true };
  });
  ipcMain.handle('get-all-categories', async (_event, filter) => {
    const havingClause = getHavingClause(filter, 'i.updatedAt', 'i.id');

    const sql = `
      SELECT
        c.*,
        COUNT(DISTINCT ii.invoiceId) AS invoiceCount,
        COUNT(DISTINCT qi.quoteId) AS quotesCount
      FROM categories c
      LEFT JOIN items it ON it.categoryId = c.id
      LEFT JOIN invoice_items ii ON ii.itemId = it.id
      LEFT JOIN quote_items qi ON qi.itemId = it.id
      LEFT JOIN invoices i ON i.id = ii.invoiceId
      LEFT JOIN quotes q ON q.id = qi.quoteId
      GROUP BY c.id
      ${havingClause}
    `;

    return {
      success: true,
      data: await getAllRows(db, sql)
    };
  });

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
    for (const row of data) {
      const result = await handleCurrencies(row);
      if (!result.success) return result;
    }
    return { success: true };
  });
  ipcMain.handle('get-all-currencies', async (_event, filter) => getAllCurrencies(filter));
};

const initIpcHandlerForDB = (dbName: string) => {
  ipcMain.handle('show-save-db-dialog', async () => {
    const defaultPath = join(process.env.USERPROFILE || process.cwd(), dbName);
    const result = await dialog.showSaveDialog({
      title: 'Select database file',
      defaultPath,
      filters: [{ name: 'SQLite DB', extensions: ['db'] }]
    });
    return { success: true, data: { canceled: result.canceled, filePath: result.filePath } };
  });
  ipcMain.handle('initialize-db', async (_event, opts: { fullPath: string }) => {
    try {
      await setupDB({ fullPath: opts.fullPath });
      return { success: true };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  });
};

export { initIpcHandler, initIpcHandlerForDB };
