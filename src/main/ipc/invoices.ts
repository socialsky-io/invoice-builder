import { ipcMain } from 'electron';
import type { Database } from 'sqlite3';
import type { Invoice } from '../types/invoice';
import { getAllRows, getFirstRow, runDb } from '../utils/dbFuntions';
import { handleEntity } from '../utils/entitiesFunctions';
import { mapSqliteError } from '../utils/errorFunctions';
import { getWhereClauseFromFilters } from '../utils/filterFunctions';

export const initInvoicesHandlers = (db: Database) => {
  const invoiceFields: (keyof Invoice)[] = [
    'invoiceType',
    'convertedFromQuotationId',
    'businessId',
    'clientId',
    'currencyId',
    'issuedAt',
    'dueDate',
    'invoiceNumber',
    'isArchived',
    'status',
    'customerNotes',
    'thanksNotes',
    'termsConditionNotes',
    'discountName',
    'businessNameSnapshot',
    'businessDescriptionSnapshot',
    'businessAddressSnapshot',
    'businessRoleSnapshot',
    'clientShortName',
    'businessShortName',
    'businessEmailSnapshot',
    'businessPhoneSnapshot',
    'businessWebsiteSnapshot',
    'businessAdditionalSnapshot',
    'businessPaymentInformationSnapshot',
    'businessLogoSnapshot',
    'businessFileSizeSnapshot',
    'businessFileTypeSnapshot',
    'businessFileNameSnapshot',
    'clientNameSnapshot',
    'clientAddressSnapshot',
    'clientDescriptionSnapshot',
    'clientEmailSnapshot',
    'clientPhoneSnapshot',
    'clientCodeSnapshot',
    'clientAdditionalSnapshot',
    'currencyCodeSnapshot',
    'currencySymbolSnapshot',
    'invoicePrefixSnapshot',
    'invoiceSuffixSnapshot',
    'currencySubunitSnapshot',
    'discountType',
    'discountAmountCents',
    'discountPercent',
    'shippingFeeCents',
    'taxName',
    'taxRate',
    'taxType'
  ];

  const handleInvoice = handleEntity<Invoice>(db, 'invoices', invoiceFields);

  ipcMain.handle('get-all-invoices', async (_event, type, filter) => {
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
        WHERE i.invoiceType = '${type}' AND ${whereClause}
        ORDER BY i.createdAt DESC
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
  ipcMain.handle('add-invoice', async (_event, data: Invoice) => {
    try {
      const result = await handleInvoice(data);

      if (!result.success) return { success: false };

      const lastRow = await getFirstRow(db, 'SELECT MAX(id) AS id FROM invoices;');

      if (!lastRow) return { success: false };

      const newId = lastRow.id as number;

      for (const item of data.invoiceItems) {
        await runDb(
          db,
          `
        INSERT INTO invoice_items (
          parentInvoiceId, itemId, itemNameSnapshot, unitPriceCentsSnapshot,
          itemDescriptionSnapshot, unitNameSnapshot, categoryNameSnapshot,
          quantity, taxRate, taxType
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
          [
            newId,
            item.itemId,
            item.itemNameSnapshot,
            item.unitPriceCentsSnapshot,
            item.itemDescriptionSnapshot ?? null,
            item.unitNameSnapshot ?? null,
            item.categoryNameSnapshot ?? null,
            item.quantity,
            item.taxRate,
            item.taxType ?? null
          ]
        );
      }

      for (const payment of data.invoicePayments) {
        await runDb(
          db,
          `
            INSERT INTO invoice_payments (
              parentInvoiceId, amountCents, paidAt, paymentMethod, notes
            ) VALUES (?, ?, ?, ?, ?)
          `,
          [newId, payment.amountCents, payment.paidAt, payment.paymentMethod, payment.notes ?? null]
        );
      }

      return { success: true };
    } catch (error) {
      return { success: false, ...mapSqliteError(error) };
    }
  });
  ipcMain.handle('update-invoice', async (_event, data: Invoice) => {
    try {
      const result = await handleInvoice(data, true);

      if (!result.success || !data.id) return { success: false };

      await runDb(db, 'DELETE FROM invoice_items WHERE parentInvoiceId = ?;', [data.id]);

      for (const item of data.invoiceItems) {
        await runDb(
          db,
          `
        INSERT INTO invoice_items (
          parentInvoiceId, itemId, itemNameSnapshot, unitPriceCentsSnapshot,
          itemDescriptionSnapshot, unitNameSnapshot, categoryNameSnapshot,
          quantity, taxRate, taxType
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
          [
            data.id,
            item.itemId,
            item.itemNameSnapshot,
            item.unitPriceCentsSnapshot,
            item.itemDescriptionSnapshot ?? null,
            item.unitNameSnapshot ?? null,
            item.categoryNameSnapshot ?? null,
            item.quantity,
            item.taxRate,
            item.taxType ?? null
          ]
        );
      }

      const ids = data.invoicePayments.map(p => p.id);
      if (ids.length > 0) {
        await runDb(
          db,
          `DELETE FROM invoice_payments 
            WHERE parentInvoiceId = ? 
            AND id NOT IN (${ids.map(() => '?').join(',')})`,
          [data.id, ...ids]
        );
      } else {
        await runDb(db, `DELETE FROM invoice_payments WHERE parentInvoiceId = ?`, [data.id]);
      }

      for (const payment of data.invoicePayments) {
        if (payment.id) {
          const existing = await getFirstRow(db, `SELECT id FROM invoice_payments WHERE id = ?`, [payment.id]);

          if (existing) {
            await runDb(
              db,
              `
                UPDATE invoice_payments
                SET amountCents = ?, paidAt = ?, paymentMethod = ?, notes = ?, updatedAt = datetime('now')
                WHERE id = ?
              `,
              [payment.amountCents, payment.paidAt, payment.paymentMethod, payment.notes ?? null, payment.id]
            );
            continue;
          }
        }

        await runDb(
          db,
          `
            INSERT INTO invoice_payments (
              parentInvoiceId, amountCents, paidAt, paymentMethod, notes
            ) VALUES (?, ?, ?, ?, ?)
          `,
          [data.id, payment.amountCents, payment.paidAt, payment.paymentMethod, payment.notes ?? null]
        );
      }

      return { success: true };
    } catch (error) {
      return { success: false, ...mapSqliteError(error) };
    }
  });
  ipcMain.handle('duplicate-invoice', async (_event, invoiceId: number, invoiceType: 'quotation' | 'invoice') => {
    try {
      const original = await getFirstRow(db, 'SELECT * FROM invoices WHERE id = ?;', [invoiceId]);
      const lastRow = await getFirstRow(db, 'SELECT MAX(id) AS id FROM invoices;');

      if (!original || !lastRow) {
        return { success: false };
      }

      const maxIDRow = lastRow.id as number;
      let convertedFromQuotationId: number | null = original.convertedFromQuotationId as number | null;
      let status: string = original.status as string;
      if (original.invoiceType === 'quotation' && invoiceType === 'invoice') {
        convertedFromQuotationId = original.id as number;
        status = 'unpaid';

        await runDb(db, `UPDATE invoices SET status = 'closed' WHERE id = ?;`, [original.id as number]);
      }

      const newInvoiceNumber = original.invoiceNumber + `-COPY${maxIDRow}`;
      const insertInvoiceSQL = `
        INSERT INTO invoices (
          invoiceType, convertedFromQuotationId, businessId, clientId, currencyId,
          issuedAt, dueDate, invoiceNumber, isArchived, status, customerNotes,
          thanksNotes, termsConditionNotes, discountName, businessNameSnapshot,
          businessShortName, businessDescriptionSnapshot, businessAddressSnapshot,
          businessRoleSnapshot, businessEmailSnapshot, businessPhoneSnapshot,
          businessWebsiteSnapshot, businessAdditionalSnapshot,
          businessPaymentInformationSnapshot, businessLogoSnapshot,
          businessFileSizeSnapshot, businessFileTypeSnapshot,
          businessFileNameSnapshot, clientNameSnapshot, clientShortName,
          clientAddressSnapshot, clientDescriptionSnapshot, clientEmailSnapshot,
          clientPhoneSnapshot, clientCodeSnapshot, clientAdditionalSnapshot,
          currencyCodeSnapshot, currencySymbolSnapshot, currencySubunitSnapshot,
          discountType, discountAmountCents, discountPercent, shippingFeeCents,
          invoicePrefixSnapshot, invoiceSuffixSnapshot, taxName, taxRate, taxType
        )
        SELECT
          ?, ?, businessId, clientId, currencyId,
          datetime('now'), dueDate, ?, isArchived, ?, customerNotes,
          thanksNotes, termsConditionNotes, discountName, businessNameSnapshot,
          businessShortName, businessDescriptionSnapshot, businessAddressSnapshot,
          businessRoleSnapshot, businessEmailSnapshot, businessPhoneSnapshot,
          businessWebsiteSnapshot, businessAdditionalSnapshot,
          businessPaymentInformationSnapshot, businessLogoSnapshot,
          businessFileSizeSnapshot, businessFileTypeSnapshot,
          businessFileNameSnapshot, clientNameSnapshot, clientShortName,
          clientAddressSnapshot, clientDescriptionSnapshot, clientEmailSnapshot,
          clientPhoneSnapshot, clientCodeSnapshot, clientAdditionalSnapshot,
          currencyCodeSnapshot, currencySymbolSnapshot, currencySubunitSnapshot,
          discountType, discountAmountCents, discountPercent, shippingFeeCents,
          invoicePrefixSnapshot, invoiceSuffixSnapshot, taxName, taxRate, taxType
        FROM invoices WHERE id = ?;
      `;

      await runDb(db, insertInvoiceSQL, [invoiceType, convertedFromQuotationId, newInvoiceNumber, status, invoiceId]);

      const lastInsertedRow = await getFirstRow(db, 'SELECT MAX(id) AS id FROM invoices;');

      if (!lastInsertedRow) return { success: false };

      const newInvoiceId = lastInsertedRow.id as number;

      await runDb(
        db,
        `
            INSERT INTO invoice_items (
              parentInvoiceId, itemId, itemNameSnapshot, unitPriceCentsSnapshot,
              itemDescriptionSnapshot, unitNameSnapshot, categoryNameSnapshot,
              quantity, taxName, taxRate, taxType
            )
            SELECT ?, itemId, itemNameSnapshot, unitPriceCentsSnapshot,
              itemDescriptionSnapshot, unitNameSnapshot, categoryNameSnapshot,
              quantity, taxName, taxRate, taxType
            FROM invoice_items WHERE parentInvoiceId = ?;
          `,
        [newInvoiceId, invoiceId]
      );

      await runDb(
        db,
        `
            INSERT INTO attachments (
              parentInvoiceId, fileName, fileType, fileSize, data
            )
            SELECT ?, fileName, fileType, fileSize, data
            FROM attachments WHERE parentInvoiceId = ?;
          `,
        [newInvoiceId, invoiceId]
      );

      return { success: true };
    } catch (error) {
      return { success: false, ...mapSqliteError(error) };
    }
  });
};
