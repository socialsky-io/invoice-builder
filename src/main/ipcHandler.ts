import { dialog, ipcMain, shell } from 'electron';
import { promises as fs } from 'fs';
import { join } from 'path';
import type { Database } from 'sqlite3';
import { setupDB } from './database';
import { DBInitType } from './enums/dbInitType';
import { FilterType } from './enums/filterType';
import { getAllRows, getFirstRow, runDb } from './functions';
import type { Business } from './types/business';
import type { Category } from './types/category';
import type { Client } from './types/client';
import type { Currency } from './types/currency';
import type { EntityWithId } from './types/entityWithId';
import type { FilterData } from './types/invoiceFilter';
import type { Item } from './types/item';
import type { SqliteValue } from './types/sqliteValue';
import type { Unit } from './types/unit';
import type { UpdateData } from './types/updateData';

interface SqliteError extends Error {
  code: string;
}

const isSqliteError = (error: unknown): error is SqliteError => {
  return error instanceof Error && 'code' in error && typeof (error as Record<string, unknown>).code === 'string';
};

const sqliteErrorMap: Record<string, string> = {
  'UNIQUE constraint failed': 'error.invalidConstraintUnique',
  'FOREIGN KEY constraint failed': 'error.invalidConstraintForeign',
  'CHECK constraint failed': 'error.invalidConstraintCheck',
  'NOT NULL constraint failed': 'error.invalidConstraintNotNull',
  SQLITE_ERROR: 'error.sqlSyntaxError',
  'datatype mismatch': 'error.datatypeMismatch',
  SQLITE_IOERR: 'error.diskIOError',
  'database is locked': 'error.databaseLocked',
  'file is not a database': 'error.databaseCorrupt'
};

const mapSqliteError = (error: unknown): { message?: string; key?: string } => {
  if (isSqliteError(error)) {
    for (const [key, mapped] of Object.entries(sqliteErrorMap)) {
      if (error.message.includes(key)) return { key: mapped };
    }
    return { message: error.message };
  }
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('Database file does not exist')) return { key: 'error.databaseFileMissing' };
    if (msg.includes('EBUSY')) return { key: 'error.databaseIsBusy' };
    return { key: 'error.unknownError', message: msg };
  }

  return { key: 'error.unknownError', message: String(error) };
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

export const getWhereClauseFromFilters = (data: {
  filters: FilterData[];
  archivedColumn?: string;
  clientNameSnapshotColumn?: string;
  businessNameSnapshotColumn?: string;
  issuedAtColumn?: string;
  statusColumn?: string;
}): string => {
  const {
    filters,
    archivedColumn,
    clientNameSnapshotColumn,
    businessNameSnapshotColumn,
    issuedAtColumn,
    statusColumn
  } = data;

  const clauses: string[] = [];

  filters.forEach(({ type, value }) => {
    switch (type) {
      case FilterType.active:
        if (archivedColumn) clauses.push(`${archivedColumn} = 0`);
        break;
      case FilterType.archived:
        if (archivedColumn) clauses.push(`${archivedColumn} = 1`);
        break;
      case FilterType.client:
        if (clientNameSnapshotColumn && value)
          clauses.push(`${clientNameSnapshotColumn} = '${value.replace(/'/g, "''")}'`);
        break;
      case FilterType.business:
        if (businessNameSnapshotColumn && value)
          clauses.push(`${businessNameSnapshotColumn} = '${value.replace(/'/g, "''")}'`);
        break;
      case FilterType.date:
        if (issuedAtColumn && value) {
          const dates = value.split(',');
          if (dates.length === 2) clauses.push(`${issuedAtColumn} BETWEEN '${dates[0]}' AND '${dates[1]}'`);
        }
        break;
      case FilterType.status:
        if (statusColumn && value) clauses.push(`${statusColumn} = '${value.replace(/'/g, "''")}'`);
        break;
      case FilterType.all:
      default:
        break;
    }
  });

  return clauses.length ? clauses.join(' AND ') : '1=1';
};

export const getHavingClauseFromFilters = (data: {
  filters: FilterData[];
  invoiceUpdatedAtColumn?: string;
  invoiceIdColumn?: string;
  archivedColumn?: string;
  clientNameSnapshotColumn?: string;
  businessNameSnapshotColumn?: string;
  issuedAtColumn?: string;
  statusColumn?: string;
}): string => {
  const {
    filters,
    invoiceUpdatedAtColumn,
    issuedAtColumn,
    invoiceIdColumn,
    archivedColumn,
    businessNameSnapshotColumn,
    clientNameSnapshotColumn,
    statusColumn
  } = data;

  if (!filters?.length) return '';

  const clauses: string[] = [];

  filters.forEach(({ type, value }) => {
    switch (type) {
      case FilterType.noInvoices30:
        if (invoiceUpdatedAtColumn)
          clauses.push(
            `(MAX(${invoiceUpdatedAtColumn}) IS NULL OR MAX(${invoiceUpdatedAtColumn}) < datetime('now', '-30 days'))`
          );
        break;
      case FilterType.noInvoices60:
        if (invoiceUpdatedAtColumn)
          clauses.push(
            `(MAX(${invoiceUpdatedAtColumn}) IS NULL OR MAX(${invoiceUpdatedAtColumn}) < datetime('now', '-60 days'))`
          );
        break;
      case FilterType.noInvoices90:
        if (invoiceUpdatedAtColumn)
          clauses.push(
            `(MAX(${invoiceUpdatedAtColumn}) IS NULL OR MAX(${invoiceUpdatedAtColumn}) < datetime('now', '-90 days'))`
          );
        break;
      case FilterType.noInvoices:
        if (invoiceIdColumn) clauses.push(`(COUNT(${invoiceIdColumn}) = 0)`);
        break;
      case FilterType.atleastOneInvoice:
        if (invoiceIdColumn) clauses.push(`(COUNT(${invoiceIdColumn}) > 0)`);
        break;
      case FilterType.active:
        if (archivedColumn) clauses.push(`(${archivedColumn} = 0)`);
        break;
      case FilterType.archived:
        if (archivedColumn) clauses.push(`(${archivedColumn} = 1)`);
        break;
      case FilterType.client:
        if (clientNameSnapshotColumn) clauses.push(`${clientNameSnapshotColumn} = '${value.replace(/'/g, "''")}'`);
        break;
      case FilterType.business:
        if (businessNameSnapshotColumn) clauses.push(`${businessNameSnapshotColumn} = '${value.replace(/'/g, "''")}'`);
        break;
      case FilterType.date:
        const dates = value.split(',');
        if (dates.length === 2 && issuedAtColumn) {
          clauses.push(`${issuedAtColumn} BETWEEN '${dates[0]}' AND '${dates[1]}'`);
        }
        break;
      case FilterType.status:
        if (statusColumn) clauses.push(`${statusColumn} = '${value.replace(/'/g, "''")}'`);
        break;
      case FilterType.all:
      default:
        break;
    }
  });

  if (!clauses.length) return '';

  return `HAVING ${clauses.join(' AND ')}`;
};

const getOrCreateByName = async (
  db: Database,
  table: 'units' | 'categories',
  name: string
): Promise<number | undefined> => {
  const row = await getFirstRow(db, `SELECT id FROM ${table} WHERE name = ? LIMIT 1`, [name]);
  if (row?.id) return row.id as number;

  await runDb(db, `INSERT INTO ${table} (name) VALUES (?)`, [name]);

  const newRow = await getFirstRow(db, `SELECT id FROM ${table} WHERE name = ? LIMIT 1`, [name]);
  if (newRow?.id) return newRow.id as number;

  return undefined;
};

const resolveItemRelations = async (db: Database, data: Item): Promise<Item> => {
  const item = { ...data };

  if (typeof item.categoryId === 'undefined' && item.categoryName) {
    item.categoryId = await getOrCreateByName(db, 'categories', item.categoryName);
  }
  if (typeof item.unitId === 'undefined' && item.unitName) {
    item.unitId = await getOrCreateByName(db, 'units', item.unitName);
  }

  return item;
};

const getAllEntities =
  <T extends Record<string, unknown>>(db: Database, table: string, keyFieldName: string) =>
  async (filter: FilterData[]) => {
    const havingClause = getHavingClauseFromFilters({
      filters: filter,
      invoiceUpdatedAtColumn: 'i.updatedAt',
      invoiceIdColumn: 'i.id',
      archivedColumn: 't.isArchived'
    });
    const sql = `
      SELECT 
        t.*,
        COUNT(DISTINCT CASE WHEN i.invoiceType = 'invoice' THEN i.id END) AS invoiceCount,
        COUNT(DISTINCT CASE WHEN i.invoiceType = 'quotation' THEN i.id END) AS quotesCount
      FROM ${table} t
      LEFT JOIN invoices i ON i.${keyFieldName} = t.id
      GROUP BY t.id
      ${havingClause ? havingClause : ''}
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
  'fileSize',
  'fileType',
  'fileName',
  'description',
  'isArchived'
];
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
const itemFields: (keyof Item)[] = ['name', 'amount', 'unitId', 'categoryId', 'description', 'isArchived'];
const currencyFields: (keyof Currency)[] = ['code', 'symbol', 'text', 'format', 'isArchived', 'subunit'];
const unitFields: (keyof Unit)[] = ['name', 'isArchived'];
const categoryFields: (keyof Category)[] = ['name', 'isArchived'];

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
  const getAllClients = getAllEntities(db, 'clients', 'clientId');
  const getAllCurrencies = getAllEntities(db, 'currencies', 'currencyId');

  ipcMain.handle('open-url', async (_event, url: string) => {
    await shell.openExternal(url);
  });

  ipcMain.handle('get-all-settings', async () => {
    const row = await getFirstRow(db, 'SELECT * FROM settings LIMIT 1');
    if (!row) return null;
    return {
      success: true,
      data: row
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
    try {
      await runDb(db, 'BEGIN TRANSACTION');
      for (const row of data) {
        const finalItem = await resolveItemRelations(db, row);
        const result = await handleItems(finalItem);
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
  ipcMain.handle('get-all-items', async (_event, filter) => {
    const havingClause = getHavingClauseFromFilters({
      filters: filter,
      invoiceUpdatedAtColumn: 'inv.updatedAt',
      invoiceIdColumn: 'inv.id',
      archivedColumn: 'it.isArchived'
    });

    const sql = `
    SELECT 
        it.*,
        COUNT(DISTINCT CASE WHEN inv.invoiceType = 'invoice' THEN ii.parentInvoiceId END) AS invoiceCount,
        COUNT(DISTINCT CASE WHEN inv.invoiceType = 'quotation' THEN ii.parentInvoiceId END) AS quotesCount,
        u.name AS unitName,
        c.name AS categoryName
    FROM items it
    LEFT JOIN units u ON it.unitId = u.id
    LEFT JOIN categories c ON it.categoryId = c.id
    LEFT JOIN invoice_items ii ON ii.itemId = it.id
    LEFT JOIN invoices inv ON ii.parentInvoiceId = inv.id
    GROUP BY it.id
    ${havingClause ? havingClause : ''}
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
    try {
      await runDb(db, 'BEGIN TRANSACTION');
      for (const row of data) {
        const result = await handleUnits(row);
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
  ipcMain.handle('get-all-units', async (_event, filter) => {
    const havingClause = getHavingClauseFromFilters({
      filters: filter,
      invoiceUpdatedAtColumn: 'inv.updatedAt',
      invoiceIdColumn: 'inv.id',
      archivedColumn: 'u.isArchived'
    });

    const sql = `
      SELECT
          u.*,
          COUNT(DISTINCT CASE WHEN inv.invoiceType = 'invoice' THEN ii.parentInvoiceId END) AS invoiceCount,
          COUNT(DISTINCT CASE WHEN inv.invoiceType = 'quotation' THEN ii.parentInvoiceId END) AS quotesCount
      FROM units u
      LEFT JOIN items it ON it.unitId = u.id
      LEFT JOIN invoice_items ii ON ii.itemId = it.id
      LEFT JOIN invoices inv ON ii.parentInvoiceId = inv.id
      GROUP BY u.id
      ${havingClause ? havingClause : ''}
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
    try {
      await runDb(db, 'BEGIN TRANSACTION');
      for (const row of data) {
        const result = await handleCategories(row);
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
  ipcMain.handle('get-all-categories', async (_event, filter) => {
    const havingClause = getHavingClauseFromFilters({
      filters: filter,
      invoiceUpdatedAtColumn: 'inv.updatedAt',
      invoiceIdColumn: 'inv.id',
      archivedColumn: 'c.isArchived'
    });

    const sql = `
      SELECT
          c.*,
          COUNT(DISTINCT CASE WHEN inv.invoiceType = 'invoice' THEN ii.parentInvoiceId END) AS invoiceCount,
          COUNT(DISTINCT CASE WHEN inv.invoiceType = 'quotation' THEN ii.parentInvoiceId END) AS quotesCount
      FROM categories c
      LEFT JOIN items it ON it.categoryId = c.id
      LEFT JOIN invoice_items ii ON ii.itemId = it.id
      LEFT JOIN invoices inv ON ii.parentInvoiceId = inv.id
      GROUP BY c.id
      ${havingClause ? havingClause : ''}
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

  ipcMain.handle('get-all-invoices', async (_event, filter) => {
    const whereClause = getWhereClauseFromFilters({
      filters: filter,
      businessNameSnapshotColumn: 'i.businessNameSnapshot',
      clientNameSnapshotColumn: 'i.clientNameSnapshot',
      archivedColumn: 'i.isArchived',
      issuedAtColumn: 'i.issuedAt',
      statusColumn: 'i.status'
    });

    const invoicesSql = `
      SELECT
          i.*,
          c.format as currencyFormat
      FROM invoices i
      INNER JOIN currencies as c on c.id = i.currencyId
      WHERE i.invoiceType = 'invoice' AND ${whereClause}
    `;
    const invoices = await getAllRows(db, invoicesSql);

    const invoiceIds = invoices.map(i => i.id) as number[];
    const placeholders = invoiceIds.map(() => '?').join(', ');
    const paymentsSql = `
      SELECT ip.*
      FROM invoice_payments as ip
      WHERE parentInvoiceId IN (${placeholders})
    `;
    const invoicePayments = await getAllRows(db, paymentsSql, invoiceIds);

    const invoiceItemsSql = `
      SELECT ii.*
      FROM invoice_items as ii
      WHERE parentInvoiceId IN (${placeholders})
    `;
    const invoiceItems = await getAllRows(db, invoiceItemsSql, invoiceIds);

    const finalInvoices = invoices.map(invoice => ({
      ...invoice,
      invoicePayments: invoicePayments.filter(p => p.parentInvoiceId === invoice.id),
      invoiceItems: invoiceItems.filter(p => p.parentInvoiceId === invoice.id)
    }));

    return {
      success: true,
      data: finalInvoices
    };
  });

  ipcMain.handle('delete-invoice', async (_event, id: number) => {
    try {
      await runDb(db, 'DELETE FROM invoices WHERE id = ?;', [id]);
      return { success: true };
    } catch (error) {
      return { success: false, ...mapSqliteError(error) };
    }
  });

  ipcMain.handle('export-all-data', async () => {
    try {
      const settingsRow = await getFirstRow(db, 'SELECT * FROM settings LIMIT 1');
      const businesses = await getAllRows(db, 'SELECT * FROM businesses');
      const clients = await getAllRows(db, 'SELECT * FROM clients');
      const items = await getAllRows(db, 'SELECT * FROM items');
      const units = await getAllRows(db, 'SELECT * FROM units');
      const categories = await getAllRows(db, 'SELECT * FROM categories');
      const currencies = await getAllRows(db, 'SELECT * FROM currencies');
      const invoices = await getAllRows(db, 'SELECT * FROM invoices');
      const invoiceItems = await getAllRows(db, 'SELECT * FROM invoice_items');
      const invoicePayments = await getAllRows(db, 'SELECT * FROM invoice_payments');
      const attachments = await getAllRows(db, 'SELECT * FROM attachments');

      const payload = {
        settings: settingsRow ?? null,
        businesses,
        clients,
        items,
        units,
        categories,
        currencies,
        invoices,
        invoiceItems,
        invoicePayments,
        attachments
      };

      const defaultFileName = `invoice-builder-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const result = await dialog.showSaveDialog({
        title: 'Export',
        defaultPath: join(process.env.USERPROFILE || process.cwd(), defaultFileName),
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });

      if (result.canceled || !result.filePath) return { success: false };

      await fs.writeFile(result.filePath, JSON.stringify(payload, null, 2), 'utf8');

      return { success: true, data: { filePath: result.filePath } };
    } catch (error) {
      return { success: false, ...mapSqliteError(error) };
    }
  });

  ipcMain.handle('import-all-data', async () => {
    const runInTransaction = async (fn: () => Promise<void>) => {
      try {
        await runDb(db, 'PRAGMA foreign_keys = OFF');
        await runDb(db, 'BEGIN TRANSACTION');
        await fn();
        await runDb(db, 'COMMIT');
      } catch (err) {
        await runDb(db, 'ROLLBACK');
        throw err;
      } finally {
        await runDb(db, 'PRAGMA foreign_keys = ON');
      }
    };

    const toSqliteValue = (value: unknown): SqliteValue => {
      if (value === undefined || value === null) return null;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
      return JSON.stringify(value);
    };

    const insertRows = async <T extends Record<string, unknown>>(table: string, rows: T[]) => {
      for (const row of rows) {
        const keys = Object.keys(row);
        if (!keys.length) continue;
        const cols = keys.join(',');
        const placeholders = keys.map(() => '?').join(',');
        const params = keys.map(k => toSqliteValue(row[k]));
        await runDb(db, `INSERT INTO ${table} (${cols}) VALUES (${placeholders})`, params);
      }
    };

    const updateSettings = async (settings: Record<string, unknown>) => {
      const fields: string[] = [];
      const params: SqliteValue[] = [];

      Object.entries(settings).forEach(([k, v]) => {
        if (k === 'id') return;
        fields.push(`${k} = ?`);
        params.push(toSqliteValue(v));
      });

      if (fields.length) {
        await runDb(
          db,
          `UPDATE settings SET ${fields.join(', ')} WHERE id = (SELECT id FROM settings LIMIT 1)`,
          params
        );
      }
    };

    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Import',
        properties: ['openFile'],
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });

      if (canceled || !filePaths?.[0]) return { success: false, message: 'canceled' };

      const content = await fs.readFile(filePaths[0], 'utf8');
      const parsed = JSON.parse(content);
      if (!parsed || typeof parsed !== 'object') return { success: false, key: 'invalidFile' };

      await runInTransaction(async () => {
        const deleteOrder = [
          'invoice_items',
          'invoice_payments',
          'attachments',
          'invoices',
          'items',
          'businesses',
          'clients',
          'units',
          'categories',
          'currencies'
        ];

        for (const table of deleteOrder) {
          await runDb(db, `DELETE FROM ${table}`);
        }

        const tableDataMap: Record<string, string> = {
          currencies: 'currencies',
          units: 'units',
          categories: 'categories',
          businesses: 'businesses',
          clients: 'clients',
          items: 'items',
          invoices: 'invoices',
          invoice_items: 'invoiceItems',
          invoice_payments: 'invoicePayments',
          attachments: 'attachments'
        };

        for (const [table, key] of Object.entries(tableDataMap)) {
          await insertRows(table, ((parsed as Record<string, unknown>)[key] as Record<string, unknown>[]) ?? []);
        }

        if (parsed.settings && typeof parsed.settings === 'object') {
          await updateSettings(parsed.settings as Record<string, unknown>);
        }
      });

      return { success: true };
    } catch (error) {
      return { success: false, ...mapSqliteError(error) };
    }
  });
};

const initIpcHandlerForDB = (dbName: string) => {
  ipcMain.handle('show-save-db-dialog', async () => {
    const defaultPath = join(process.env.USERPROFILE || process.cwd(), dbName);
    const result = await dialog.showSaveDialog({
      title: 'Select a path and database file name',
      defaultPath,
      filters: [{ name: 'SQLite DB', extensions: ['db'] }]
    });
    return { success: true, data: { canceled: result.canceled, filePath: result.filePath } };
  });
  ipcMain.handle('show-open-db-dialog', async () => {
    const defaultPath = join(process.env.USERPROFILE || process.cwd(), dbName);
    const result = await dialog.showOpenDialog({
      title: 'Open existing database file',
      defaultPath,
      filters: [{ name: 'SQLite DB', extensions: ['db'] }],
      properties: ['openFile']
    });
    return {
      success: true,
      data: {
        canceled: result.canceled,
        filePath: Array.isArray(result.filePaths) && result.filePaths.length ? result.filePaths[0] : undefined
      }
    };
  });
  ipcMain.handle('initialize-db', async (_event, opts: { fullPath: string; mode?: DBInitType }) => {
    try {
      resetIPCHandlers();
      const createIfMissing = opts.mode === DBInitType.create || typeof opts.mode === 'undefined';
      await setupDB({ fullPath: opts.fullPath, createIfMissing });
      return { success: true };
    } catch (error) {
      return { success: false, ...mapSqliteError(error) };
    }
  });
};

const resetIPCHandlers = () => {
  ipcMain.removeHandler('open-url');

  ipcMain.removeHandler('get-all-settings');
  ipcMain.removeHandler('update-settings');

  ipcMain.removeHandler('add-client');
  ipcMain.removeHandler('update-client');
  ipcMain.removeHandler('delete-client');
  ipcMain.removeHandler('batch-add-client');
  ipcMain.removeHandler('get-all-clients');

  ipcMain.removeHandler('add-business');
  ipcMain.removeHandler('update-business');
  ipcMain.removeHandler('delete-business');
  ipcMain.removeHandler('batch-add-business');
  ipcMain.removeHandler('get-all-businesses');

  ipcMain.removeHandler('add-item');
  ipcMain.removeHandler('update-item');
  ipcMain.removeHandler('delete-item');
  ipcMain.removeHandler('batch-add-item');
  ipcMain.removeHandler('get-all-items');

  ipcMain.removeHandler('add-unit');
  ipcMain.removeHandler('update-unit');
  ipcMain.removeHandler('delete-unit');
  ipcMain.removeHandler('batch-add-unit');
  ipcMain.removeHandler('get-all-units');

  ipcMain.removeHandler('add-category');
  ipcMain.removeHandler('update-category');
  ipcMain.removeHandler('delete-category');
  ipcMain.removeHandler('batch-add-category');
  ipcMain.removeHandler('get-all-categories');

  ipcMain.removeHandler('add-currency');
  ipcMain.removeHandler('update-currency');
  ipcMain.removeHandler('delete-currency');
  ipcMain.removeHandler('batch-add-currency');
  ipcMain.removeHandler('get-all-currencies');

  ipcMain.removeHandler('get-all-invoices');

  ipcMain.removeHandler('export-all-data');
  ipcMain.removeHandler('import-all-data');
};

export { initIpcHandler, initIpcHandlerForDB, resetIPCHandlers };
