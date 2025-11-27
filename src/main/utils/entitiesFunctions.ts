import type { Database } from 'sqlite3';
import type { EntityWithId } from '../types/entityWithId';
import type { FilterData } from '../types/invoiceFilter';
import { getAllRows, runDb } from './dbFuntions';
import { mapSqliteError } from './errorFunctions';
import { getHavingClauseFromFilters } from './filterFunctions';

export const getAllEntities =
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

export const handleEntity =
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
