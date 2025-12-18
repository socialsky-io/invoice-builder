import { Text, View } from '@react-pdf/renderer';
import { memo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { InvoiceFromData } from '../../../shared/types/invoice';
import { PDF_STYLES } from './constant';

interface Props {
  invoiceForm?: InvoiceFromData;
}
const NotesComponent: FC<Props> = ({ invoiceForm }) => {
  const { t } = useTranslation();

  return (
    <View style={[PDF_STYLES.mt20]}>
      {invoiceForm?.thanksNotes && (
        <View style={[PDF_STYLES.regular, PDF_STYLES.italic]}>
          <Text>{invoiceForm?.thanksNotes}</Text>
        </View>
      )}
      {invoiceForm?.customerNotes && (
        <View style={[PDF_STYLES.mt10]}>
          <View style={[PDF_STYLES.regularBold]}>
            <Text>{t('invoices.customerNote')}</Text>
          </View>
          <View style={[PDF_STYLES.regular]}>
            <Text>{invoiceForm?.customerNotes}</Text>
          </View>
        </View>
      )}
      {invoiceForm?.termsConditionNotes && (
        <View style={[PDF_STYLES.mt10]}>
          <View style={[PDF_STYLES.regularBold]}>
            <Text>{t('invoices.termsConditions')}</Text>
          </View>
          <View style={[PDF_STYLES.regular]}>
            <Text>{invoiceForm?.termsConditionNotes}</Text>
          </View>
        </View>
      )}
    </View>
  );
};
export const Notes = memo(NotesComponent);
