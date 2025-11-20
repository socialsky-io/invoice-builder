import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { getFirstRow, runAsync } from './functions';
import { initIpcHandler } from './ipcHandler';

let db: sqlite3.Database;
let dbPath: string | undefined;

const initInitialData = async () => {
  const row = await getFirstRow(db, 'SELECT * FROM settings LIMIT 1');

  if (row) return null;

  await runAsync(db, `INSERT OR IGNORE INTO settings DEFAULT VALUES`);
  await runAsync(
    db,
    `
      INSERT OR IGNORE INTO currencies (code, symbol, text, format)
      VALUES
        ('USD', '$', 'United States Dollar', '{symbol}{amount}'),
        ('EUR', '€', 'Euro', '{symbol}{amount}'),
        ('SEK', 'kr', 'Swedish Krona', '{symbol} {amount}'),
        ('GBP', '£', 'British Pound', '{symbol}{amount}'),
        ('JPY', '¥', 'Japanese Yen', '{symbol}{amount}'),
        ('AUD', 'A$', 'Australian Dollar', '{symbol}{amount}'),
        ('CAD', 'CA$', 'Canadian Dollar', '{symbol}{amount}'),
        ('CHF', 'CHF', 'Swiss Franc', '{symbol} {amount}'),
        ('CNY', '¥', 'Chinese Yuan', '{symbol}{amount}'),
        ('INR', '₹', 'Indian Rupee', '{symbol}{amount}');
    `
  );
  await runAsync(
    db,
    `
      INSERT OR IGNORE INTO units (name)
      VALUES
        ('pcs'),
        ('kgs'),
        ('gs'),
        ('lbs'),
        ('ozs'),
        ('ls'),
        ('mls'),
        ('ms'),
        ('cms'),
        ('fts'),
        ('hrs'),
        ('mins'),
        ('secs');
    `
  );
  await runAsync(
    db,
    `
      INSERT OR IGNORE INTO categories (name)
      VALUES
        ('Goods'),
        ('Services');
    `
  );
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
      file_size INTEGER,
      file_type TEXT,
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
    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
      updatedAt DATETIME NOT NULL DEFAULT (datetime('now'))
    );
  `
  );
  await runAsync(
    db,
    `
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
      updatedAt DATETIME NOT NULL DEFAULT (datetime('now'))
    );
  `
  );
  await runAsync(
    db,
    `
    CREATE TABLE IF NOT EXISTS currencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      symbol TEXT NOT NULL UNIQUE,
      text TEXT NOT NULL UNIQUE,
      format TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
      updatedAt DATETIME NOT NULL DEFAULT (datetime('now'))
    );
  `
  );
  await runAsync(
    db,
    `
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      amount_cents INTEGER DEFAULT (0), 
      unitId INTEGER,
      categoryId INTEGER,
      description TEXT,
      createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
      updatedAt DATETIME NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (unitId) REFERENCES units(id) ON DELETE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
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
      currencyId INTEGER NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
      updatedAt DATETIME NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (businessId) REFERENCES businesses(id) ON DELETE CASCADE,
      FOREIGN KEY (cliendId) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (currencyId) REFERENCES currencies(id) ON DELETE CASCADE
    )
  `
  );
  await runAsync(
    db,
    `
    CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceId INTEGER NOT NULL,
        itemId INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE
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
      currencyId INTEGER NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
      updatedAt DATETIME NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (businessId) REFERENCES businesses(id) ON DELETE CASCADE,
      FOREIGN KEY (cliendId) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (currencyId) REFERENCES currencies(id) ON DELETE CASCADE
    )
  `
  );
  await runAsync(
    db,
    `
    CREATE TABLE IF NOT EXISTS quote_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quoteId INTEGER NOT NULL,
        itemId INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (quoteId) REFERENCES quotes(id) ON DELETE CASCADE,
        FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE
    )
  `
  );
};

const initDatabase = async () => {
  if (!dbPath) throw new Error('Database path not set');

  await new Promise<void>((resolve, reject) => {
    db = new sqlite3.Database(dbPath!, err => {
      if (err) {
        reject(new Error(`Failed to open database: ${err.message}`));
        return;
      }
      console.log('Database opened successfully.');
      resolve();
    });
  });
};

const setupDB = async (data: { fullPath: string }) => {
  const folder = path.dirname(data.fullPath);
  fs.mkdirSync(folder, { recursive: true });
  dbPath = data.fullPath;

  await initDatabase();
  await init();
  await initInitialData();
  initIpcHandler(db, dbPath);
};

export { db, setupDB };
