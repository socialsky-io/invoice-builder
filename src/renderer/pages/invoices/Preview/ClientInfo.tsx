import { Text, View } from '@react-pdf/renderer';
import { memo, type FC } from 'react';
import { useUppercaseTranslation } from '../../../shared/hooks/useUppercaseTranslation';
import type { InvoiceFromData } from '../../../shared/types/invoice';
import { PDF_STYLES } from './constant';

interface Props {
  invoiceForm?: InvoiceFromData;
}
const ClientInfoComponent: FC<Props> = ({ invoiceForm }) => {
  const { tt } = useUppercaseTranslation(invoiceForm?.customizationLabelUpperCase);

  return (
    <View style={[PDF_STYLES.alignStart, PDF_STYLES.gap4, PDF_STYLES.w50]}>
      <Text style={PDF_STYLES.regularBold}>{tt('invoices.billTo')}:</Text>
      <Text style={PDF_STYLES.businessText}>{invoiceForm?.clientNameSnapshot}</Text>
      <Text style={PDF_STYLES.businessText}>{invoiceForm?.clientAddressSnapshot}</Text>
      <Text style={PDF_STYLES.businessText}>{invoiceForm?.clientEmailSnapshot}</Text>
      <Text style={PDF_STYLES.businessText}>{invoiceForm?.clientPhoneSnapshot}</Text>
      <Text style={PDF_STYLES.businessText}>{invoiceForm?.clientCodeSnapshot}</Text>
      <Text style={PDF_STYLES.businessText}>{invoiceForm?.clientAdditionalSnapshot}</Text>
    </View>
  );
};
export const ClientInfo = memo(ClientInfoComponent);
