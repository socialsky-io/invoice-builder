import sqlite3 from 'sqlite3';
import type { SqliteValue } from './types/sqliteValue';

const BOOLEAN_FIELDS = [
  'isDarkMode',
  'shouldIncludeYear',
  'shouldIncludeMonth',
  'shouldIncludeBusinessName',
  'quotesON',
  'reportsON',
  'isArchived'
] as const;

export const runAsync = (db: sqlite3.Database, sql: string) =>
  new Promise<void>((resolve, reject) => {
    db.run(sql, err => (err ? reject(err) : resolve()));
  });

const runDb = (db: sqlite3.Database, sql: string, params: SqliteValue[] = []): Promise<void> => {
  const convertedParams = params.map(p => (p === true ? 1 : p === false ? 0 : p));

  return new Promise((resolve, reject) => {
    db.run(sql, convertedParams, function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
};

const getFirstRow = <T extends Record<string, unknown>>(
  db: sqlite3.Database,
  sql: string,
  params: SqliteValue[] = []
): Promise<T | null> => {
  const convertedParams = params.map(p => (p === true ? 1 : p === false ? 0 : p));

  return new Promise((resolve, reject) => {
    db.get(sql, convertedParams, (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);

      BOOLEAN_FIELDS.forEach(key => {
        const convertedRow = row as Record<string, unknown>;
        if (key in convertedRow) {
          convertedRow[key] = Boolean(convertedRow[key]);
        }
      });

      resolve(row as T);
    });
  });
};

const getAllRows = <T extends Record<string, unknown>>(
  db: sqlite3.Database,
  sql: string,
  params: SqliteValue[] = []
): Promise<T[]> => {
  const convertedParams = params.map(p => (p === true ? 1 : p === false ? 0 : p));

  return new Promise((resolve, reject) => {
    db.all(sql, convertedParams, (err, rows) => {
      if (err) return reject(err);

      const transformedRows = (rows as Record<string, unknown>[]).map(row => {
        const convertedRow = { ...row };
        BOOLEAN_FIELDS.forEach(key => {
          if (key in convertedRow) {
            convertedRow[key] = Boolean(convertedRow[key]);
          }
        });
        return convertedRow as unknown as T;
      });

      resolve(transformedRows as T[]);
    });
  });
};

export { getAllRows, getFirstRow, runDb };
