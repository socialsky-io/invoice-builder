import type { DiscountType } from '../enums/discountType';
import type { InvoiceStatus } from '../enums/invoiceStatus';
import type { InvoiceType } from '../enums/invoiceType';

export interface Invoice {
  id?: number;
  invoiceType: InvoiceType;
  convertedFromQuotationId?: number | null;
  businessId: number;
  clientId: number;
  currencyId: number;
  createdAt?: string;
  updatedAt?: string;
  issuedAt: string;
  dueDate?: string | null;
  invoiceNumber: string;
  isArchived?: boolean;
  state: InvoiceStatus;
  customerNotes?: string | null;
  thanksNotes?: string | null;
  termsConditionNotes?: string | null;
  discountName?: string | null;
  businessNameSnapshot: string;
  businessDescriptionSnapshot?: string | null;
  businessAddressSnapshot?: string | null;
  businessRoleSnapshot?: string | null;
  businessEmailSnapshot?: string | null;
  businessPhoneSnapshot?: string | null;
  businessWebsiteSnapshot?: string | null;
  businessAdditionalSnapshot?: string | null;
  businessPaymentInformationSnapshot?: string | null;
  businessLogoSnapshot?: Uint8Array | null;
  businessFileSizeSnapshot?: number | null;
  businessFileTypeSnapshot?: string | null;
  businessFileNameSnapshot?: string | null;
  clientNameSnapshot: string;
  clientAddressSnapshot?: string | null;
  clientDescriptionSnapshot?: string | null;
  clientEmailSnapshot?: string | null;
  clientPhoneSnapshot?: string | null;
  clientCodeSnapshot?: string | null;
  clientAdditionalSnapshot?: string | null;
  currencyCodeSnapshot: string;
  currencySymbolSnapshot: string;
  currencySubunitSnapshot: number;
  discountType?: DiscountType | null;
  discountAmountCents?: number;
  discountPercent?: number;
  shippingFeeCents?: number;
  invoicePayments: InvoicePayment[];
  currencyFormat: string;
}

export interface InvoicePayment {
  id: number;
  parentInvoiceId: number;
  amountCents: number;
  paidAt: string;
  paymentMethod: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}
