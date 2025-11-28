import { DiscountType } from '../enums/discountType';
import { InvoiceItemTaxType, InvoiceTaxType } from '../enums/taxType';
import type { Invoice, InvoiceItem, InvoicePayment } from '../types/invoice';

export const getTotalAmountPaidCents = (invoicePayments: InvoicePayment[]): number => {
  if (!invoicePayments || invoicePayments.length === 0) {
    return 0;
  }

  const totalCents = invoicePayments.reduce((sum, p) => sum + p.amountCents, 0);
  return totalCents;
};

export const getSubTotalAmountCents = (invoiceItems: InvoiceItem[], includeTax: boolean = true): number => {
  if (!invoiceItems || invoiceItems.length === 0) return 0;

  return invoiceItems.reduce((sum, item) => {
    const amountCents = getInvoiceItemAmountCents(item);

    if (includeTax) {
      const taxAmountCents = getInvoiceItemTaxCents(item);
      if (item.taxType !== InvoiceItemTaxType.inclusive) return sum + amountCents + taxAmountCents;

      return sum + amountCents;
    }

    return sum + amountCents;
  }, 0);
};

export const getInvoiceItemAmountCents = (invoiceItem: InvoiceItem): number => {
  return invoiceItem.unitPriceCentsSnapshot * invoiceItem.quantity;
};

export const getDiscountAmountCents = (invoice: Invoice): number => {
  if (!invoice.discountType) {
    return 0;
  }

  if (invoice.discountType === DiscountType.fixed) return invoice.discountAmountCents;

  const subTotalCents = getSubTotalAmountCents(invoice.invoiceItems, false);
  return (subTotalCents * invoice.discountPercent) / 100;
};

export const getTotalAmountAfterDiscountCents = (invoice: Invoice): number => {
  const discountCents = getDiscountAmountCents(invoice);
  const subTotalCents = getSubTotalAmountCents(invoice.invoiceItems);

  return subTotalCents - discountCents;
};

export const getTotalAmountCents = (invoice: Invoice): number => {
  const amountCents = getTotalAmountAfterDiscountCents(invoice);
  const taxAmountCents = getInvoiceTaxCents(invoice);

  if (invoice.taxType !== InvoiceTaxType.inclusive) return amountCents + taxAmountCents + invoice.shippingFeeCents;

  return amountCents + invoice.shippingFeeCents;
};

export const getBalanceDueCents = (invoice: Invoice): number => {
  const amountPaidCents = getTotalAmountPaidCents(invoice.invoicePayments);
  const totalAmountCents = getTotalAmountCents(invoice);

  return totalAmountCents - amountPaidCents;
};

export const getInvoiceTaxCents = (invoice: Invoice): number => {
  if (!invoice.taxType) {
    return 0;
  }
  const amountCents = getTotalAmountAfterDiscountCents(invoice);

  if (invoice.taxType === InvoiceTaxType.exclusive) {
    return (amountCents * invoice.taxRate) / 100;
  } else if (invoice.taxType === InvoiceTaxType.inclusive) {
    return (amountCents * invoice.taxRate) / (100 + invoice.taxRate);
  } else if (invoice.taxType === InvoiceTaxType.deducted) {
    return -(amountCents * invoice.taxRate) / 100;
  }

  return 0;
};

export const getInvoiceItemTaxCents = (invoiceItem: InvoiceItem): number => {
  if (!invoiceItem.taxType) {
    return 0;
  }
  const amountCents = getInvoiceItemAmountCents(invoiceItem);

  if (invoiceItem.taxType === InvoiceItemTaxType.exclusive) {
    return (amountCents * invoiceItem.taxRate) / 100;
  } else if (invoiceItem.taxType === InvoiceItemTaxType.inclusive) {
    return (amountCents * invoiceItem.taxRate) / (100 + invoiceItem.taxRate);
  }
  return 0;
};

export const getUnitPrice = (data: { supportsSubunit?: boolean; amountCents: number; subunit?: number }): number => {
  const { supportsSubunit, amountCents, subunit } = data;
  const unitPrice = supportsSubunit ? amountCents / subunit! : amountCents;

  return unitPrice;
};

export const getTotalUnitPrice = (data: { unitPrice: number; quantity: number }): number => {
  const { unitPrice, quantity } = data;

  return unitPrice * quantity;
};

export const getUnitPriceTax = (data: { unitPrice: number; taxType?: InvoiceItemTaxType; taxRate: number }): number => {
  const { unitPrice, taxType, taxRate } = data;

  if (!taxType) {
    return 0;
  }

  if (taxType === InvoiceItemTaxType.exclusive) {
    return (unitPrice * taxRate) / 100;
  } else if (taxType === InvoiceItemTaxType.inclusive) {
    return (unitPrice * taxRate) / (100 + taxRate);
  }
  return 0;
};
