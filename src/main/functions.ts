import sqlite3 from 'sqlite3';

export type SqliteValue = string | number | boolean | null;

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
      resolve(rows as T[]);
    });
  });
};

export { getAllRows, getFirstRow, runDb };
