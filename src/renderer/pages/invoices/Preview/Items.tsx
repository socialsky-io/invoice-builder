import { Text, View } from '@react-pdf/renderer';
import { memo, useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { InvoiceFromData } from '../../../shared/types/invoice';
import type { Settings } from '../../../shared/types/settings';
import { createCurrencyFormatter } from '../../../shared/utils/formatFunctions';
import { getItemFinancialData } from '../../../shared/utils/invoiceFunctions';
import { PDF_STYLES } from './constant';

interface Props {
  invoiceForm?: InvoiceFromData;
  storeSettings?: Settings;
}
const ItemsComponent: FC<Props> = ({ invoiceForm, storeSettings }) => {
  const { t } = useTranslation();
  const format = useMemo(
    () => (invoiceForm ? createCurrencyFormatter(storeSettings!, invoiceForm) : (n: number) => String(n)),
    [storeSettings, invoiceForm]
  );

  return (
    <>
      <View style={[PDF_STYLES.row, PDF_STYLES.tableHeader]}>
        <View style={[PDF_STYLES.tableCol, PDF_STYLES.w10]}>
          <Text style={PDF_STYLES.tableCellHeader}>#</Text>
        </View>
        <View style={[PDF_STYLES.tableCol, PDF_STYLES.w30]}>
          <Text style={PDF_STYLES.tableCellHeader}>{t('common.item')}</Text>
        </View>
        <View style={[PDF_STYLES.tableCol, PDF_STYLES.w15]}>
          <Text style={PDF_STYLES.tableCellHeader}>{t('common.unit')}</Text>
        </View>
        <View style={[PDF_STYLES.tableCol, PDF_STYLES.w15]}>
          <Text style={PDF_STYLES.tableCellHeader}>{t('common.qty')}</Text>
        </View>
        <View style={[PDF_STYLES.tableCol, PDF_STYLES.w15]}>
          <Text style={PDF_STYLES.tableCellHeader}>{t('common.unitCost')}</Text>
        </View>
        <View style={[PDF_STYLES.tableCol, PDF_STYLES.w15]}>
          <Text style={PDF_STYLES.tableCellHeader}>{t('common.total')}</Text>
        </View>
      </View>
      {invoiceForm?.invoiceItems?.map((item, index) => {
        const { unitPriceCentsSnapshot = 0, quantity, itemNameSnapshot, unitNameSnapshot, taxType, taxRate } = item;

        const { formattedUnitPrice, formattedTotal, formattedTax } = getItemFinancialData({
          storeSettings,
          invoiceForm,
          unitPriceCents: unitPriceCentsSnapshot,
          quantity,
          taxType,
          taxRate,
          format
        });

        return (
          <View key={`invoice-item-prev-${item.itemId}-${index}`} style={PDF_STYLES.row}>
            <View style={[PDF_STYLES.tableCol, PDF_STYLES.w10]}>
              <Text style={PDF_STYLES.tableCell}>{index + 1}</Text>
            </View>
            <View style={[PDF_STYLES.tableCol, PDF_STYLES.w30]}>
              <Text style={PDF_STYLES.tableCell}>{itemNameSnapshot}</Text>
              {taxType && (
                <Text style={PDF_STYLES.tableCellSubtle}>
                  {t('invoices.itemTax', {
                    rate: taxRate,
                    amount: formattedTax
                  })}
                </Text>
              )}
            </View>
            <View style={[PDF_STYLES.tableCol, PDF_STYLES.w15]}>
              <Text style={PDF_STYLES.tableCell}>{unitNameSnapshot}</Text>
            </View>
            <View style={[PDF_STYLES.tableCol, PDF_STYLES.w15]}>
              <Text style={PDF_STYLES.tableCell}>{quantity}</Text>
            </View>
            <View style={[PDF_STYLES.tableCol, PDF_STYLES.w15]}>
              <Text style={PDF_STYLES.tableCell}>{formattedUnitPrice}</Text>
            </View>
            <View style={[PDF_STYLES.tableCol, PDF_STYLES.w15]}>
              <Text style={PDF_STYLES.tableCell}>{formattedTotal}</Text>
            </View>
          </View>
        );
      })}
    </>
  );
};
export const Items = memo(ItemsComponent);
