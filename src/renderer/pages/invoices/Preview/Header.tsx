import { View } from '@react-pdf/renderer';
import { memo, type FC } from 'react';
import { InvoiceType } from '../../../shared/enums/invoiceType';
import type { InvoiceFromData } from '../../../shared/types/invoice';
import { BusinessInfo } from './BusinessInfo';
import { ClientInfo } from './ClientInfo';
import { PDF_STYLES } from './constant';
import { InvoiceInformationInfo } from './InvoiceInformationInfo';
import { PaymentInfo } from './PaymentInfo';

interface Props {
  invoiceForm?: InvoiceFromData;
  type: InvoiceType;
}
const HeaderComponent: FC<Props> = ({ invoiceForm, type }) => {
  return (
    <View style={PDF_STYLES.header}>
      <View style={[PDF_STYLES.row, PDF_STYLES.spaceBetween, PDF_STYLES.alignStart]}>
        <BusinessInfo invoiceForm={invoiceForm} />
        <InvoiceInformationInfo invoiceForm={invoiceForm} type={type} />
      </View>
      <View style={[PDF_STYLES.row, PDF_STYLES.spaceBetween, PDF_STYLES.alignStart, PDF_STYLES.mt20]}>
        <ClientInfo invoiceForm={invoiceForm} />
        <View style={PDF_STYLES.flexGrow} />
        <PaymentInfo invoiceForm={invoiceForm} />
      </View>
    </View>
  );
};
export const Header = memo(HeaderComponent);
