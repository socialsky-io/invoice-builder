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
  await runAsync(db, 'PRAGMA foreign_keys = ON;');
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
      fileSize INTEGER,
      fileType TEXT,
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
      amountCents INTEGER DEFAULT (0), 
      unitId INTEGER,
      categoryId INTEGER,
      description TEXT,
      createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
      updatedAt DATETIME NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (unitId) REFERENCES units(id),
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    );
  `
  );
  await runAsync(
    db,
    `
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoiceType TEXT NOT NULL CHECK(invoiceType IN ('quotation','invoice')),
      convertedFromQuotationId INTEGER NULL,
      businessId INTEGER NOT NULL,
      clientId INTEGER NOT NULL,
      currencyId INTEGER NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
      updatedAt DATETIME NOT NULL DEFAULT (datetime('now')),
      issuedAt DATETIME NOT NULL,
      dueDate DATETIME,
      invoiceNumber TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft','ready','partially-paid','paid','void')),
      customerNotes TEXT,
      thanksNotes TEXT,
      termsConditionNotes TEXT,
      discountName TEXT,
      businessNameSnapshot TEXT NOT NULL,
      businessAddressSnapshot TEXT,
      businessRoleSnapshot TEXT,
      businessEmailSnapshot TEXT,
      businessPhoneSnapshot TEXT,
      businessWebsiteSnapshot TEXT,
      businessAdditionalSnapshot TEXT,
      businessPaymentInformationSnapshot TEXT,
      businessLogoSnapshot BLOB,
      businessFileSizeSnapshot INTEGER,
      businessFileTypeSnapshot TEXT,
      clientNameSnapshot TEXT NOT NULL,
      clientAddressSnapshot TEXT,
      clientEmailSnapshot TEXT,
      clientPhoneSnapshot TEXT,
      clientCodeSnapshot TEXT,
      clientAdditionalSnapshot TEXT,
      currencyCodeSnapshot TEXT NOT NULL,
      currencySymbolSnapshot TEXT NOT NULL,
      discountType TEXT CHECK(discountType IN ('fixed','percentage')),
      discountAmountCents INTEGER DEFAULT 0, 
      discountPercent REAL DEFAULT 0 ,
      shippingFeeCents INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (businessId) REFERENCES businesses(id),
      FOREIGN KEY (clientId) REFERENCES clients(id),
      FOREIGN KEY (currencyId) REFERENCES currencies(id),
      FOREIGN KEY (convertedFromQuotationId) REFERENCES invoices(id),
      UNIQUE (businessId, invoiceNumber),
      CHECK (
        (discountType = 'fixed' AND discountAmountCents >= 0 AND discountPercent = 0) OR
        (discountType = 'percentage' AND discountPercent >= 0 AND discountAmountCents = 0) OR
        (discountType IS NULL)
      ),
      CHECK (dueDate IS NULL OR dueDate >= issuedAt),
      CHECK (convertedFromQuotationId IS NULL OR convertedFromQuotationId != id)
    )
  `
  );
  await runAsync(
    db,
    `
    CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceId INTEGER,       
        quoteId INTEGER,
        itemId INTEGER,
        itemNameSnapshot TEXT NOT NULL,
        unitPriceCentsSnapshot INTEGER NOT NULL DEFAULT (0), 
        itemDescriptionSnapshot TEXT,
        unitNameSnapshot TEXT,
        categoryNameSnapshot TEXT,
        quantity INTEGER NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
        updatedAt DATETIME NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (quoteId) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE SET NULL,
        CHECK (
          (invoiceId IS NOT NULL AND quoteId IS NULL) OR
          (invoiceId IS NULL AND quoteId IS NOT NULL)
        )
    )
  `
  );
  await runAsync(
    db,
    `
    CREATE TABLE IF NOT EXISTS invoice_taxes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoiceId INTEGER,       
      quoteId INTEGER,
      name TEXT NOT NULL,              
      rate REAL NOT NULL,                 
      type TEXT NOT NULL CHECK(type IN ('exclusive','inclusive','deducted')), 
      amountCents INTEGER NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
      updatedAt DATETIME NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
      FOREIGN KEY (quoteId) REFERENCES invoices(id) ON DELETE CASCADE,
      CHECK (
        (invoiceId IS NOT NULL AND quoteId IS NULL) OR
        (invoiceId IS NULL AND quoteId IS NOT NULL)
      )
    )
  `
  );
  await runAsync(
    db,
    `
    CREATE TABLE IF NOT EXISTS invoice_item_taxes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceItemId INTEGER,
        quoteItemId INTEGER,
        name TEXT NOT NULL,
        rate REAL NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('exclusive','inclusive','deducted')),
        amountCents INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
        updatedAt DATETIME NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (invoiceItemId) REFERENCES invoice_items(id) ON DELETE CASCADE,
        FOREIGN KEY (quoteItemId) REFERENCES invoice_items(id) ON DELETE CASCADE,
        CHECK (
          (invoiceItemId IS NOT NULL AND quoteItemId IS NULL) OR
          (invoiceItemId IS NULL AND quoteItemId IS NOT NULL)
        )
    )
  `
  );
  await runAsync(
    db,
    `
    CREATE TABLE IF NOT EXISTS invoice_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceId INTEGER,       
        quoteId INTEGER,
        amountCents INTEGER NOT NULL,
        paidAt DATETIME NOT NULL DEFAULT (datetime('now')),
        paymentMethod TEXT NOT NULL,           
        notes TEXT,
        createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
        updatedAt DATETIME NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (quoteId) REFERENCES invoices(id) ON DELETE CASCADE,
        CHECK (
          (invoiceId IS NOT NULL AND quoteId IS NULL) OR
          (invoiceId IS NULL AND quoteId IS NOT NULL)
        )
    )
  `
  );
  await runAsync(
    db,
    `
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoiceId INTEGER,       
      quoteId INTEGER,
      filename TEXT NOT NULL,
      fileType TEXT NOT NULL,            
      fileSize INTEGER NOT NULL,        
      data BLOB NOT NULL,                
      createdAt DATETIME NOT NULL DEFAULT (datetime('now')),
      updatedAt DATETIME NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
      FOREIGN KEY (quoteId) REFERENCES invoices(id) ON DELETE CASCADE,
      CHECK (
        (invoiceId IS NOT NULL AND quoteId IS NULL) OR
        (invoiceId IS NULL AND quoteId IS NOT NULL)
      )
    )
  `
  );
  await runAsync(db, `CREATE INDEX IF NOT EXISTS idx_invoice_items_invoiceId ON invoice_items(invoiceId)`);
  await runAsync(db, `CREATE INDEX IF NOT EXISTS idx_invoice_taxes_invoiceId ON invoice_taxes(invoiceId)`);
  await runAsync(db, `CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoiceId ON invoice_payments(invoiceId)`);
  await runAsync(db, `CREATE INDEX IF NOT EXISTS idx_attachments_invoiceId ON attachments(invoiceId)`);
  await runAsync(db, `CREATE INDEX IF NOT EXISTS idx_invoices_clientId ON invoices(clientId)`);
  await runAsync(db, `CREATE INDEX IF NOT EXISTS idx_invoices_businessId ON invoices(businessId)`);
  await runAsync(db, `CREATE INDEX IF NOT EXISTS idx_invoices_business_client ON invoices(businessId, clientId)`);
  await runAsync(db, `CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices(invoiceType)`);
  await runAsync(
    db,
    `CREATE INDEX IF NOT EXISTS idx_invoices_convertedFromQuotationId ON invoices(convertedFromQuotationId)`
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
