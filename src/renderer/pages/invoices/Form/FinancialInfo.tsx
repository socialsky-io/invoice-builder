import { Box, Typography } from '@mui/material';
import { useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { DiscountType } from '../../../shared/enums/discountType';
import { InvoiceItemTaxType, InvoiceTaxType } from '../../../shared/enums/taxType';
import type { InvoiceFromData } from '../../../shared/types/invoice';
import { getFinancialData } from '../../../shared/utils/invoiceFunctions';
import { useAppSelector } from '../../../state/configureStore';
import { selectSettings } from '../../../state/pageSlice';

interface Props {
  invoiceForm?: InvoiceFromData;
  // onEdit: () => void;
}

export const FinancialInfo: FC<Props> = ({ invoiceForm }) => {
  const storeSettings = useAppSelector(selectSettings);
  const { t } = useTranslation();

  const {
    formattedSubTotalAmount,
    totalAmountFormatted,
    formattedTotalTaxAmount,
    discountAmountFormatted,
    shippingAmountFormatted,
    totalAmountPaidFormatted,
    balanceDueFormatted
  } = useMemo(() => getFinancialData({ storeSettings, invoiceForm }), [storeSettings, invoiceForm]);

  const hasPerItemTaxExclusive = useMemo(
    () => invoiceForm?.invoiceItems?.some(item => item.taxType === InvoiceItemTaxType.exclusive),
    [invoiceForm]
  );

  const hasPerItemTaxInclusive = useMemo(
    () => invoiceForm?.invoiceItems?.some(item => item.taxType === InvoiceItemTaxType.inclusive),
    [invoiceForm]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        alignItems: 'end',
        justifyContent: 'end',
        width: '100%',
        pt: 2,
        pb: 2,
        pl: 2,
        pr: 2
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'end'
        }}
      >
        <Typography
          component="div"
          variant="body1"
          sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {t('invoices.subTotal')}
        </Typography>
        <Typography
          component="div"
          variant="body1"
          sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {invoiceForm?.discountType === DiscountType.percentage &&
            t('invoices.discountPrct', { prct: invoiceForm.discountPercent })}

          {invoiceForm?.discountType !== DiscountType.percentage && t('invoices.discount')}
        </Typography>
        <Typography
          component="div"
          variant="body1"
          sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {(invoiceForm?.taxType === InvoiceTaxType.deducted || invoiceForm?.taxType === InvoiceTaxType.exclusive) &&
            t('invoices.taxExclusive', { name: invoiceForm.taxName, prct: invoiceForm.taxRate })}
          {invoiceForm?.taxType === InvoiceTaxType.inclusive &&
            t('invoices.taxInclusive', { name: invoiceForm.taxName, prct: invoiceForm.taxRate })}
          {hasPerItemTaxExclusive && t('invoices.taxExclusivePerItem')}
          {hasPerItemTaxInclusive && t('invoices.taxInclusivePerItem')}
          {!hasPerItemTaxExclusive &&
            !hasPerItemTaxInclusive &&
            invoiceForm?.taxType === undefined &&
            t('invoices.tax', { prct: invoiceForm?.taxRate ?? 0 })}
        </Typography>
        <Typography
          component="div"
          variant="body1"
          sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {t('invoices.shippingFee')}
        </Typography>
        <Typography
          component="div"
          variant="body1"
          sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {t('invoices.total')}
        </Typography>
        <Typography
          component="div"
          variant="body1"
          sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {t('invoices.paid')}
        </Typography>
        <Typography
          component="div"
          variant="body1"
          sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {t('invoices.balanceDue')}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'end'
        }}
      >
        <Typography
          component="div"
          variant="body1"
          sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {formattedSubTotalAmount}
        </Typography>
        <Typography
          component="div"
          variant="body1"
          sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {discountAmountFormatted}
        </Typography>
        <Typography
          component="div"
          variant="body1"
          sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {formattedTotalTaxAmount}
        </Typography>
        <Typography
          component="div"
          variant="body1"
          sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {shippingAmountFormatted}
        </Typography>
        <Typography
          component="div"
          variant="body1"
          sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {totalAmountFormatted}
        </Typography>
        <Typography
          component="div"
          variant="body1"
          sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {totalAmountPaidFormatted}
        </Typography>
        <Typography
          component="div"
          variant="body1"
          sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {balanceDueFormatted}
        </Typography>
      </Box>
    </Box>
  );
};
