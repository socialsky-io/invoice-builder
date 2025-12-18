import { Document, Font, Page, PDFViewer } from '@react-pdf/renderer';
import { memo, type FC } from 'react';
import type { InvoiceFromData } from '../../../shared/types/invoice';
import { useAppSelector } from '../../../state/configureStore';
import { selectSettings } from '../../../state/pageSlice';
import RobotoBold from './../../../assets/roboto/static/Roboto-Bold.ttf';
import RobotoItalic from './../../../assets/roboto/static/Roboto-Italic.ttf';
import RobotoRegular from './../../../assets/roboto/static/Roboto-Regular.ttf';
import { PDF_STYLES } from './constant';
import { FinancialInfo } from './FinancialInfo';
import { Header } from './Header';
import { Items } from './Items';
import { Notes } from './Notes';

Font.register({
  family: 'Roboto',
  src: RobotoRegular
});

Font.register({
  family: 'Roboto',
  src: RobotoBold,
  fontWeight: 'bold'
});

Font.register({
  family: 'Roboto',
  src: RobotoItalic,
  fontStyle: 'italic'
});

interface Props {
  invoiceForm?: InvoiceFromData;
  setInvoiceForm?: React.Dispatch<React.SetStateAction<InvoiceFromData | undefined>>;
}
const InvoicesPreviewComponent: FC<Props> = ({ setInvoiceForm = () => {}, invoiceForm }) => {
  const storeSettings = useAppSelector(selectSettings);

  return (
    <PDFViewer
      key={JSON.stringify(invoiceForm)}
      style={{ width: '100%', height: '100%', border: 'none' }}
      showToolbar={false}
    >
      <Document>
        <Page size="A4" style={PDF_STYLES.page}>
          <Header invoiceForm={invoiceForm} storeSettings={storeSettings} />
          <Items invoiceForm={invoiceForm} storeSettings={storeSettings} />
          <FinancialInfo invoiceForm={invoiceForm} storeSettings={storeSettings} />
          <Notes invoiceForm={invoiceForm} />
        </Page>
      </Document>
    </PDFViewer>
  );
};
export const InvoicesPreview = memo(InvoicesPreviewComponent);
