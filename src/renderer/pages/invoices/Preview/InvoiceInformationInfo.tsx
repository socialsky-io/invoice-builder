import { Text, View } from '@react-pdf/renderer';
import { memo, type FC } from 'react';
import { InvoiceType } from '../../../shared/enums/invoiceType';
import { useUppercaseTranslation } from '../../../shared/hooks/useUppercaseTranslation';
import type { InvoiceFromData } from '../../../shared/types/invoice';
import type { Settings } from '../../../shared/types/settings';
import { formatDate } from '../../../shared/utils/formatFunctions';
import { PDF_STYLES } from './constant';

interface Props {
  invoiceForm?: InvoiceFromData;
  storeSettings?: Settings;
}
const InvoiceInformationInfoComponent: FC<Props> = ({ invoiceForm, storeSettings }) => {
  const { tt } = useUppercaseTranslation(invoiceForm?.customizationLabelUpperCase);

  return (
    <View style={[PDF_STYLES.alignEnd, PDF_STYLES.gap4, PDF_STYLES.w50]}>
      <Text style={[PDF_STYLES.title, { color: invoiceForm?.customizationColor }]}>
        {invoiceForm?.invoiceType === InvoiceType.invoice ? tt('invoices.pdfINVOICE') : tt('invoices.pdfQUOTE')}
      </Text>

      <View style={[PDF_STYLES.gap3, PDF_STYLES.alignEnd]}>
        <View style={[PDF_STYLES.row, PDF_STYLES.alignEnd]}>
          <Text style={PDF_STYLES.regularBold}>{tt('common.invoiceNumber')}: </Text>
          <Text style={PDF_STYLES.regular}>
            {invoiceForm?.invoicePrefixSnapshot}
            {invoiceForm?.invoiceNumber}
            {invoiceForm?.invoiceSuffixSnapshot}
          </Text>
        </View>
        {storeSettings && invoiceForm?.issuedAt && (
          <View style={[PDF_STYLES.row, PDF_STYLES.alignEnd]}>
            <Text style={PDF_STYLES.regularBold}>{tt('common.date')}: </Text>
            <Text style={PDF_STYLES.regular}>{formatDate(invoiceForm.issuedAt, storeSettings.dateFormat)}</Text>
          </View>
        )}
        {storeSettings && invoiceForm?.dueDate && (
          <View style={[PDF_STYLES.row, PDF_STYLES.alignEnd]}>
            <Text style={PDF_STYLES.regularBold}>{tt('common.dueDate')}: </Text>
            <Text style={PDF_STYLES.regular}>{formatDate(invoiceForm.dueDate, storeSettings.dateFormat)}</Text>
          </View>
        )}
      </View>
    </View>
  );
};
export const InvoiceInformationInfo = memo(InvoiceInformationInfoComponent);
