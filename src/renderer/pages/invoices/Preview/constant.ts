import { StyleSheet } from '@react-pdf/renderer';

export const PDF_STYLES = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 12,
    fontFamily: 'Roboto'
  },
  header: { marginBottom: 16 },
  row: { flexDirection: 'row' },
  spaceBetween: { justifyContent: 'space-between' },
  flexGrow: { flexGrow: 1 },
  gap3: { gap: 3 },
  gap4: { gap: 4 },
  gap5: { gap: 5 },
  mt20: { marginTop: 20 },
  mt10: { marginTop: 10 },
  mt5: { marginTop: 5 },
  mb5: { marginBottom: 5 },
  w40: { width: '40%' },
  w50: { width: '50%' },
  w10: { width: '5%' },
  w30: { width: '30%' },
  w15: { width: '15%' },
  border: { height: 1, backgroundColor: '#e0e0e0' },
  maxw50: { maxWidth: '50%' },
  alignStart: { alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
  business: { fontSize: 14, fontWeight: 500 },
  businessText: { fontSize: 10, fontWeight: 400, color: '#808080' },
  businessLogo: { width: 64, height: 64 },
  title: { fontSize: 20, fontWeight: 700 },
  regular: { fontSize: 10, fontWeight: 400 },
  regularBold: { fontSize: 10, fontWeight: 600, color: '#333333' },
  italic: { fontStyle: 'italic' },
  table: {
    width: '100%',
    marginTop: 10
  },
  tableHeader: {
    backgroundColor: '#f0f0f0'
  },
  tableCol: {
    padding: 6
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  tableCell: {
    fontSize: 9
  },
  tableCellSubtle: {
    color: '#808080',
    fontSize: 8
  }
});
