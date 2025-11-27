import { dialog, ipcMain } from 'electron';
import { promises as fs } from 'fs';
import { join } from 'path';
import type { Database } from 'sqlite3';
import type { SqliteValue } from '../types/sqliteValue';
import { getAllRows, getFirstRow, runDb, toSqliteValue } from '../utils/dbFuntions';
import { mapSqliteError } from '../utils/errorFunctions';

export const initImportExportHandlers = (db: Database) => {
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
