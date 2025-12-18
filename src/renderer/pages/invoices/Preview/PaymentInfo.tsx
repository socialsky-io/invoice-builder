import { Text, View } from '@react-pdf/renderer';
import { memo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { InvoiceFromData } from '../../../shared/types/invoice';
import { PDF_STYLES } from './constant';

interface Props {
  invoiceForm?: InvoiceFromData;
}
const PaymentInfoComponent: FC<Props> = ({ invoiceForm }) => {
  const { t } = useTranslation();

  return (
    <View style={[PDF_STYLES.alignStart, PDF_STYLES.gap4, PDF_STYLES.maxw50]}>
      <Text style={PDF_STYLES.regularBold}>{t('common.paymentInfo')}:</Text>
      <Text style={PDF_STYLES.businessText}>{invoiceForm?.businessPaymentInformationSnapshot}</Text>
    </View>
  );
};
export const PaymentInfo = memo(PaymentInfoComponent);
