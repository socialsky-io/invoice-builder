import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import { InvoiceFormMode } from '../../shared/enums/invoiceFormMode';
import { InvoiceStatus } from '../../shared/enums/invoiceStatus';
import { InvoiceType } from '../../shared/enums/invoiceType';
import type { Invoice, InvoiceFromData } from '../../shared/types/invoice';
import { InvoiceForm } from './Form/index';
import { InvoicesPreview } from './Preview';

interface Props {
  invoice?: Invoice;
  type: InvoiceType;
  mode: InvoiceFormMode;
  handleChange?: (data: { invoice: InvoiceFromData; isFormValid: boolean }) => void;
  handleDelete?: (id: number) => void;
  handleDuplicate?: (id: number, invoiceType: InvoiceType) => void;
}
export const Form: FC<Props> = ({
  type,
  mode,
  handleChange = () => {},
  invoice,
  handleDelete = () => {},
  handleDuplicate = () => {}
}) => {
  const [invoiceForm, setInvoiceForm] = useState<InvoiceFromData | undefined>(undefined);
  const [isFormValid, setIsFormValid] = useState(false);
  const debounceTimerRef = useRef<number | undefined>(undefined);

  const checkFormValid = useCallback(() => {
    if (
      invoiceForm?.businessId !== undefined &&
      invoiceForm?.clientId !== undefined &&
      invoiceForm?.currencyId !== undefined &&
      invoiceForm?.issuedAt !== undefined &&
      invoiceForm?.invoiceNumber !== undefined &&
      invoiceForm?.invoiceItems &&
      invoiceForm?.invoiceItems.length > 0
    ) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [invoiceForm]);

  useEffect(() => {
    if (invoice) {
      setInvoiceForm({
        ...invoice,
        businessLogoSnapshot: invoice.businessLogoSnapshot
      });
    } else {
      setInvoiceForm({
        invoiceType: type,
        status: type === InvoiceType.quotation ? InvoiceStatus.open : InvoiceStatus.unpaid,
        taxRate: 0,
        isArchived: false,
        discountAmountCents: 0,
        discountPercent: 0,
        shippingFeeCents: 0,
        invoiceItems: [],
        invoicePayments: [],
        invoiceAttachments: []
      });
    }
  }, [invoice, type]);

  useEffect(() => {
    checkFormValid();
  }, [invoiceForm, checkFormValid]);

  useEffect(() => {
    if (!invoiceForm) return;

    if (debounceTimerRef.current !== undefined) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      handleChange({
        invoice: invoiceForm,
        isFormValid
      });
    }, 250);

    return () => {
      if (debounceTimerRef.current !== undefined) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [invoiceForm, isFormValid, handleChange]);

  if (mode === InvoiceFormMode.edit) {
    return (
      <InvoiceForm
        type={type}
        setInvoiceForm={setInvoiceForm}
        invoiceForm={invoiceForm}
        handleDelete={handleDelete}
        handleDuplicate={handleDuplicate}
      />
    );
  }

  return <InvoicesPreview type={type} setInvoiceForm={setInvoiceForm} invoiceForm={invoiceForm} />;
};
