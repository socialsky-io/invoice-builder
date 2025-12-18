import { Document, Font, Page, PDFViewer } from '@react-pdf/renderer';
import { memo, type FC } from 'react';
import { InvoiceType } from '../../../shared/enums/invoiceType';
import type { InvoiceFromData } from '../../../shared/types/invoice';
import RobotoBold from './../../../assets/roboto/static/Roboto-Bold.ttf';
import RobotoRegular from './../../../assets/roboto/static/Roboto-Regular.ttf';
import { PDF_STYLES } from './constant';
import { Header } from './Header';

Font.register({
  family: 'Roboto',
  src: RobotoRegular
});

Font.register({
  family: 'Roboto',
  src: RobotoBold,
  fontWeight: 'bold'
});

interface Props {
  invoiceForm?: InvoiceFromData;
  type: InvoiceType;
  setInvoiceForm?: React.Dispatch<React.SetStateAction<InvoiceFromData | undefined>>;
}
const InvoicesPreviewComponent: FC<Props> = ({ setInvoiceForm = () => {}, invoiceForm, type }) => {
  return (
    <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }} showToolbar={false}>
      <Document>
        <Page size="A4" style={PDF_STYLES.page}>
          <Header invoiceForm={invoiceForm} type={type} />
        </Page>
      </Document>
    </PDFViewer>
  );
};
export const InvoicesPreview = memo(InvoicesPreviewComponent);
