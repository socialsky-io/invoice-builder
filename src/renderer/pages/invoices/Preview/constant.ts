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
  w50: { width: '50%' },
  maxw50: { maxWidth: '50%' },
  alignStart: { alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
  business: { fontSize: 14, fontWeight: 500 },
  businessText: { fontSize: 10, fontWeight: 400, color: '#808080' },
  businessLogo: { width: 64, height: 64 },
  title: { fontSize: 20, fontWeight: 700 },
  regular: { fontSize: 10, fontWeight: 400 },
  regularBold: { fontSize: 10, fontWeight: 600, color: '#333333' }
});
