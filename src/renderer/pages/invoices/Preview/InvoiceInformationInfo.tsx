import { Text, View } from '@react-pdf/renderer';
import { memo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { InvoiceType } from '../../../shared/enums/invoiceType';
import type { InvoiceFromData } from '../../../shared/types/invoice';
import { formatDate } from '../../../shared/utils/formatFunctions';
import { useAppSelector } from '../../../state/configureStore';
import { selectSettings } from '../../../state/pageSlice';
import { PDF_STYLES } from './constant';

interface Props {
  invoiceForm?: InvoiceFromData;
  type: InvoiceType;
}
const InvoiceInformationInfoComponent: FC<Props> = ({ invoiceForm, type }) => {
  const { t } = useTranslation();
  const storeSettings = useAppSelector(selectSettings);

  return (
    <View style={[PDF_STYLES.alignEnd, PDF_STYLES.gap4, PDF_STYLES.w50]}>
      <Text style={PDF_STYLES.title}>
        {type === InvoiceType.invoice ? t('invoices.pdfINVOICE') : t('invoices.pdfQUOTE')}
      </Text>

      <View style={[PDF_STYLES.gap3, PDF_STYLES.alignEnd]}>
        <View style={[PDF_STYLES.row, PDF_STYLES.alignEnd]}>
          <Text style={PDF_STYLES.regularBold}>{t('common.invoiceNumber')}: </Text>
          <Text style={PDF_STYLES.regular}>
            {invoiceForm?.invoicePrefixSnapshot}
            {invoiceForm?.invoiceNumber}
            {invoiceForm?.invoiceSuffixSnapshot}
          </Text>
        </View>
        {storeSettings && invoiceForm?.issuedAt && (
          <View style={[PDF_STYLES.row, PDF_STYLES.alignEnd]}>
            <Text style={PDF_STYLES.regularBold}>{t('common.date')}: </Text>
            <Text style={PDF_STYLES.regular}>{formatDate(invoiceForm.issuedAt, storeSettings.dateFormat)}</Text>
          </View>
        )}
        {storeSettings && invoiceForm?.dueDate && (
          <View style={[PDF_STYLES.row, PDF_STYLES.alignEnd]}>
            <Text style={PDF_STYLES.regularBold}>{t('common.dueDate')}: </Text>
            <Text style={PDF_STYLES.regular}>{formatDate(invoiceForm.dueDate, storeSettings.dateFormat)}</Text>
          </View>
        )}
      </View>
    </View>
  );
};
export const InvoiceInformationInfo = memo(InvoiceInformationInfoComponent);
