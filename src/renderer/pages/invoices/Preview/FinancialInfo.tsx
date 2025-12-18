import { Text, View } from '@react-pdf/renderer';
import { memo, useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { DiscountType } from '../../../shared/enums/discountType';
import { InvoiceStatus } from '../../../shared/enums/invoiceStatus';
import { InvoiceType } from '../../../shared/enums/invoiceType';
import { InvoiceItemTaxType, InvoiceTaxType } from '../../../shared/enums/taxType';
import type { InvoiceFromData } from '../../../shared/types/invoice';
import type { Settings } from '../../../shared/types/settings';
import { getFinancialData } from '../../../shared/utils/invoiceFunctions';
import { PDF_STYLES } from './constant';

interface Props {
  invoiceForm?: InvoiceFromData;
  storeSettings?: Settings;
}
const FinancialInfoComponent: FC<Props> = ({ invoiceForm, storeSettings }) => {
  const { t } = useTranslation();

  const {
    formattedSubTotalAmount,
    totalAmountFormatted,
    formattedTotalTaxAmount,
    discountAmountFormatted,
    shippingAmountFormatted,
    totalAmountPaidFormatted,
    balanceDueFormatted,
    shippingAmount,
    discountAmount,
    totalTax,
    totalAmountPaid
  } = useMemo(() => getFinancialData({ storeSettings, invoiceForm: invoiceForm }), [storeSettings, invoiceForm]);

  const hasPerItemTaxExclusive = useMemo(
    () => invoiceForm?.invoiceItems?.some(item => item.taxType === InvoiceItemTaxType.exclusive),
    [invoiceForm]
  );

  const hasPerItemTaxInclusive = useMemo(
    () => invoiceForm?.invoiceItems?.some(item => item.taxType === InvoiceItemTaxType.inclusive),
    [invoiceForm]
  );

  return (
    <View style={[PDF_STYLES.mt10]}>
      {(discountAmount > 0 || totalTax > 0 || shippingAmount > 0) && (
        <View style={[PDF_STYLES.row]}>
          <View style={PDF_STYLES.flexGrow} />
          <View style={[PDF_STYLES.row, PDF_STYLES.w40]}>
            <View style={[PDF_STYLES.regularBold, PDF_STYLES.w50]}>
              <Text>{t('invoices.subTotal')}</Text>
            </View>
            <View style={[PDF_STYLES.regularBold, PDF_STYLES.w50, PDF_STYLES.alignEnd]}>
              <Text>{formattedSubTotalAmount}</Text>
            </View>
          </View>
        </View>
      )}

      {discountAmount > 0 && (
        <View style={[PDF_STYLES.row, PDF_STYLES.mt5]}>
          <View style={PDF_STYLES.flexGrow} />
          <View style={[PDF_STYLES.row, PDF_STYLES.w40]}>
            <View style={[PDF_STYLES.regular, PDF_STYLES.w50]}>
              <Text>
                {invoiceForm?.discountType === DiscountType.percentage &&
                  t('invoices.discountPrct', { prct: invoiceForm.discountPercent })}

                {invoiceForm?.discountType !== DiscountType.percentage && t('invoices.discount')}
              </Text>
            </View>
            <View style={[PDF_STYLES.regular, PDF_STYLES.w50, PDF_STYLES.alignEnd]}>
              <Text>{discountAmountFormatted}</Text>
            </View>
          </View>
        </View>
      )}

      {totalTax > 0 && (
        <View style={[PDF_STYLES.row, PDF_STYLES.mt5]}>
          <View style={PDF_STYLES.flexGrow} />
          <View style={[PDF_STYLES.row, PDF_STYLES.w40]}>
            <View style={[PDF_STYLES.regular, PDF_STYLES.w50]}>
              <Text>
                {(invoiceForm?.taxType === InvoiceTaxType.deducted ||
                  invoiceForm?.taxType === InvoiceTaxType.exclusive) &&
                  (invoiceForm.taxName
                    ? t('invoices.taxExclusive', {
                        name: invoiceForm.taxName,
                        prct: invoiceForm.taxRate
                      })
                    : t('invoices.tax', {
                        prct: invoiceForm.taxRate
                      }))}
                {invoiceForm?.taxType === InvoiceTaxType.inclusive &&
                  (invoiceForm.taxName
                    ? t('invoices.taxInclusive', {
                        name: invoiceForm.taxName,
                        prct: invoiceForm.taxRate
                      })
                    : t('invoices.taxInclusivePlaceholder', {
                        prct: invoiceForm.taxRate
                      }))}
                {hasPerItemTaxExclusive && t('invoices.taxExclusivePerItem')}
                {hasPerItemTaxInclusive && t('invoices.taxInclusivePerItem')}
                {!hasPerItemTaxExclusive &&
                  !hasPerItemTaxInclusive &&
                  !invoiceForm?.taxType &&
                  t('invoices.tax', { prct: invoiceForm?.taxRate ?? 0 })}
              </Text>
            </View>
            <View style={[PDF_STYLES.regular, PDF_STYLES.w50, PDF_STYLES.alignEnd]}>
              <Text>{formattedTotalTaxAmount}</Text>
            </View>
          </View>
        </View>
      )}

      {shippingAmount > 0 && (
        <View style={[PDF_STYLES.row, PDF_STYLES.mt5]}>
          <View style={PDF_STYLES.flexGrow} />
          <View style={[PDF_STYLES.row, PDF_STYLES.w40]}>
            <View style={[PDF_STYLES.regular, PDF_STYLES.w50]}>
              <Text>{t('invoices.shippingFee')}</Text>
            </View>
            <View style={[PDF_STYLES.regular, PDF_STYLES.w50, PDF_STYLES.alignEnd]}>
              <Text>{shippingAmountFormatted}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={[PDF_STYLES.row, PDF_STYLES.mt5, PDF_STYLES.mb5]}>
        <View style={PDF_STYLES.flexGrow} />
        <View style={[PDF_STYLES.border, PDF_STYLES.w40]} />
      </View>

      {(totalAmountPaid > 0 ||
        invoiceForm?.status === InvoiceStatus.paid ||
        invoiceForm?.invoiceType === InvoiceType.quotation) && (
        <View style={[PDF_STYLES.row]}>
          <View style={PDF_STYLES.flexGrow} />
          <View style={[PDF_STYLES.row, PDF_STYLES.w40]}>
            <View style={[PDF_STYLES.regularBold, PDF_STYLES.w50]}>
              <Text>{t('invoices.total')}</Text>
            </View>
            <View style={[PDF_STYLES.regularBold, PDF_STYLES.w50, PDF_STYLES.alignEnd]}>
              <Text>{totalAmountFormatted}</Text>
            </View>
          </View>
        </View>
      )}

      {totalAmountPaid > 0 &&
        invoiceForm?.invoiceType === InvoiceType.invoice &&
        invoiceForm?.status !== InvoiceStatus.paid && (
          <View style={[PDF_STYLES.row, PDF_STYLES.mt5]}>
            <View style={PDF_STYLES.flexGrow} />
            <View style={[PDF_STYLES.row, PDF_STYLES.w40]}>
              <View style={[PDF_STYLES.regular, PDF_STYLES.w50]}>
                <Text>{t('invoices.paid')}</Text>
              </View>
              <View style={[PDF_STYLES.regular, PDF_STYLES.w50, PDF_STYLES.alignEnd]}>
                <Text>{totalAmountPaidFormatted}</Text>
              </View>
            </View>
          </View>
        )}

      {invoiceForm?.invoiceType === InvoiceType.invoice && invoiceForm?.status !== InvoiceStatus.paid && (
        <View style={[PDF_STYLES.row, PDF_STYLES.mt5]}>
          <View style={PDF_STYLES.flexGrow} />
          <View style={[PDF_STYLES.row, PDF_STYLES.w40]}>
            <View style={[PDF_STYLES.regularBold, PDF_STYLES.w50]}>
              <Text>{t('invoices.balanceDue')}</Text>
            </View>
            <View style={[PDF_STYLES.regularBold, PDF_STYLES.w50, PDF_STYLES.alignEnd]}>
              <Text>{balanceDueFormatted}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
export const FinancialInfo = memo(FinancialInfoComponent);
