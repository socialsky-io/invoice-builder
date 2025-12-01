import { DiscountType } from '../enums/discountType';
import { InvoiceItemTaxType, InvoiceTaxType } from '../enums/taxType';
import type { Invoice, InvoiceFromData, InvoiceItem, InvoicePayment } from '../types/invoice';
import type { Settings } from '../types/settings';
import { createCurrencyFormatter, supportsCurrencySubunit } from './formatFunctions';

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
  return getTotalUnitPrice({ unitPrice: invoiceItem.unitPriceCentsSnapshot, quantity: invoiceItem.quantity });
};

export const getTotalUnitPrice = (data: { unitPrice: number; quantity: number }): number => {
  const { unitPrice, quantity } = data;

  return unitPrice * quantity;
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
  const amountCents = getTotalAmountAfterDiscountCents(invoice);
  return getInvoiceTax({ unitPrice: amountCents, taxType: invoice.taxType, taxRate: invoice.taxRate });
};

export const getInvoiceItemTaxCents = (invoiceItem: InvoiceItem): number => {
  const amountCents = getInvoiceItemAmountCents(invoiceItem);
  return getUnitTax({ unitPrice: amountCents, taxType: invoiceItem.taxType, taxRate: invoiceItem.taxRate });
};

export const getUnitPrice = (data: { supportsSubunit?: boolean; amountCents: number; subunit?: number }): number => {
  const { supportsSubunit, amountCents, subunit } = data;
  const unitPrice = supportsSubunit ? amountCents / subunit! : amountCents;

  return unitPrice;
};

export const getUnitTax = (data: { unitPrice: number; taxType?: InvoiceItemTaxType; taxRate: number }): number => {
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

export const getInvoiceTax = (data: { unitPrice: number; taxType?: InvoiceTaxType; taxRate: number }): number => {
  const { unitPrice, taxType, taxRate } = data;

  if (!taxType) {
    return 0;
  }
  if (taxType === InvoiceTaxType.exclusive) {
    return (unitPrice * taxRate) / 100;
  } else if (taxType === InvoiceTaxType.inclusive) {
    return (unitPrice * taxRate) / (100 + taxRate);
  } else if (taxType === InvoiceTaxType.deducted) {
    return -(unitPrice * taxRate) / 100;
  }

  return 0;
};

export const getItemFinancialData = (data: {
  storeSettings?: Settings;
  invoiceForm: InvoiceFromData;
  unitPriceCents: number;
  quantity: number;
  taxType?: InvoiceItemTaxType;
  taxRate: number;
}) => {
  const { storeSettings, invoiceForm, unitPriceCents, quantity, taxType, taxRate } = data;

  const supportsSubunit = supportsCurrencySubunit(storeSettings, invoiceForm);
  const format = createCurrencyFormatter(storeSettings!, invoiceForm);

  const unitPrice = getUnitPrice({
    supportsSubunit: supportsSubunit,
    amountCents: unitPriceCents,
    subunit: invoiceForm.currencySubunitSnapshot
  });
  const totalUnitPrice = getTotalUnitPrice({ unitPrice, quantity });
  const invoiceTaxAmount = getUnitTax({
    unitPrice: totalUnitPrice,
    taxType,
    taxRate
  });

  return {
    unitPrice,
    formattedUnitPrice: format(unitPrice),
    totalUnitPrice,
    formattedTotal: format(totalUnitPrice),
    invoiceTaxAmount,
    formattedTax: format(invoiceTaxAmount)
  };
};

export const getFinancialData = (data: { storeSettings?: Settings; invoiceForm?: InvoiceFromData }) => {
  const { storeSettings, invoiceForm } = data;

  const supportsSubunit = supportsCurrencySubunit(storeSettings, invoiceForm);
  const format = createCurrencyFormatter(storeSettings!, invoiceForm!);

  let subTotalAmount = 0;
  let totalItemTaxAmount = 0;
  let isInclusive = false;

  invoiceForm?.invoiceItems?.forEach(item => {
    const { totalUnitPrice, invoiceTaxAmount } = getItemFinancialData({
      storeSettings,
      invoiceForm,
      unitPriceCents: item.unitPriceCentsSnapshot,
      quantity: item.quantity,
      taxType: item.taxType,
      taxRate: item.taxRate
    });

    subTotalAmount += totalUnitPrice;
    totalItemTaxAmount += invoiceTaxAmount;

    if (item.taxType === InvoiceItemTaxType.inclusive) {
      isInclusive = true;
    }
  });
  if (!isInclusive && invoiceForm?.taxType === InvoiceTaxType.inclusive) {
    isInclusive = true;
  }

  let discountBaseCents = 0;
  if (invoiceForm?.discountType === DiscountType.fixed) {
    discountBaseCents = invoiceForm.discountAmountCents ?? 0;
  } else if (invoiceForm?.discountType === DiscountType.percentage) {
    discountBaseCents = (subTotalAmount * (invoiceForm?.discountPercent ?? 0)) / 100;
  }
  const discountAmount = getUnitPrice({
    supportsSubunit,
    amountCents: discountBaseCents,
    subunit: invoiceForm?.currencySubunitSnapshot
  });

  const shippingAmount = getUnitPrice({
    supportsSubunit,
    amountCents: invoiceForm?.shippingFeeCents ?? 0,
    subunit: invoiceForm?.currencySubunitSnapshot
  });

  const totalAmountAfterDiscount = subTotalAmount - discountAmount;

  const invoiceLevelTax = getInvoiceTax({
    unitPrice: totalAmountAfterDiscount,
    taxType: invoiceForm?.taxType,
    taxRate: invoiceForm?.taxRate ?? 0
  });

  const taxTotalAmount = totalItemTaxAmount + invoiceLevelTax;
  let totalAmount = totalAmountAfterDiscount + shippingAmount;
  if (isInclusive) {
    totalAmount += taxTotalAmount;
  }

  const totalAmountPaid = getUnitPrice({
    supportsSubunit,
    amountCents: getTotalAmountPaidCents(invoiceForm?.invoicePayments ?? []),
    subunit: invoiceForm?.currencySubunitSnapshot
  });

  const balanceDue = totalAmount - totalAmountPaid;

  return {
    formattedSubTotalAmount: format(subTotalAmount),
    formattedTotalTaxAmount: format(taxTotalAmount),
    subTotalAmount,
    totalTax: taxTotalAmount,
    discountAmount,
    discountAmountFormatted: format(discountAmount),
    shippingAmount,
    shippingAmountFormatted: format(shippingAmount),
    totalAmount,
    totalAmountFormatted: format(totalAmount),
    totalAmountPaid,
    totalAmountPaidFormatted: format(totalAmountPaid),
    balanceDue,
    balanceDueFormatted: format(balanceDue)
  };
};
