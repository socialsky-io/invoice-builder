import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { getFirstRow, runAsync } from './functions';
import { initIpcHandler } from './ipcHandler';

let db: sqlite3.Database;
let dbPath: string;

const initInitialData = async () => {
  const row = await getFirstRow(db, 'SELECT * FROM settings LIMIT 1');

  if (row) return null;

  if (!row) {
    db.run(`INSERT INTO settings DEFAULT VALUES`);
  }
};

const init = async () => {
  await runAsync(
    db,
    `
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      language TEXT NOT NULL DEFAULT 'en',
      amountFormat TEXT NOT NULL DEFAULT 'en-US',
      dateFormat TEXT NOT NULL DEFAULT 'MM/dd/yyyy',
      isDarkMode INTEGER NOT NULL DEFAULT 1 CHECK (isDarkMode IN (0,1)),
      invoicePrefix TEXT,
      invoiceSuffix TEXT,
      shouldIncludeYear INTEGER NOT NULL DEFAULT 1 CHECK (shouldIncludeYear IN (0,1)),
      shouldIncludeMonth INTEGER NOT NULL DEFAULT 1 CHECK (shouldIncludeMonth IN (0,1)),
      shouldIncludeBusinessName INTEGER NOT NULL DEFAULT 1 CHECK (shouldIncludeBusinessName IN (0,1)),
      quotesON INTEGER NOT NULL DEFAULT 1 CHECK (quotesON IN (0,1)),
      reportsON INTEGER NOT NULL DEFAULT 1 CHECK (reportsON IN (0,1)),
      overviewCardsON INTEGER NOT NULL DEFAULT 1 CHECK (overviewCardsON IN (0,1)),
      createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
      updatedAt DATETIME NOT NULL DEFAULT (datetime('now'))
    )
  `
  );
  await runAsync(
    db,
    `
    CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      shortName TEXT NOT NULL CHECK (length(shortName) = 2),
      address TEXT,
      role TEXT,
      email TEXT,
      phone TEXT,
      website TEXT,
      additional TEXT,
      paymentInformation TEXT,
      logo BLOB,
      createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
      updatedAt DATETIME NOT NULL DEFAULT (datetime('now'))
    );
  `
  );
  await runAsync(
    db,
    `
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      shortName TEXT NOT NULL CHECK (length(shortName) = 2),
      address TEXT,
      email TEXT,
      phone TEXT,
      code TEXT,
      additional TEXT,
      createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
      updatedAt DATETIME NOT NULL DEFAULT (datetime('now'))
    );
  `
  );
  await runAsync(
    db,
    `
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      businessId INTEGER NOT NULL,
      cliendId INTEGER NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
      updatedAt DATETIME NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (businessId) REFERENCES businesses(id) ON DELETE CASCADE,
      FOREIGN KEY (cliendId) REFERENCES clients(id) ON DELETE CASCADE
    )
  `
  );
  await runAsync(
    db,
    `
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      businessId INTEGER NOT NULL,
      cliendId INTEGER NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
      updatedAt DATETIME NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (businessId) REFERENCES businesses(id) ON DELETE CASCADE,
      FOREIGN KEY (cliendId) REFERENCES clients(id) ON DELETE CASCADE
    )
  `
  );
};

const initDatabase = async () => {
  if (!dbPath) return;

  try {
    db = new sqlite3.Database(dbPath, err => {
      if (err) {
        throw new Error(`Failed to open database: ${err.message}`);
      } else {
        console.log('Database opened successfully.');
      }
    });
  } catch {}
};

const setupDB = (data: { dbname: string; appName?: string; onReady?: () => void }) => {
  const databaseFileName = data.dbname;
  const localAppData = process.env.LOCALAPPDATA;
  if (data.appName && localAppData) {
    app.setName(data.appName);

    const folderPath = path.join(localAppData, app.getName());
    fs.mkdirSync(folderPath, { recursive: true });

    dbPath = path.join(folderPath, databaseFileName);

    initDatabase().then(async () => {
      await init();
      await initInitialData();
      initIpcHandler(db, dbPath);
      if (data.onReady) {
        data.onReady();
      }
    });
  }
};

export { db, setupDB };
