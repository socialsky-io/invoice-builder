import { Box, Card, CardActionArea, CardContent, darken, lighten, Typography, useTheme } from '@mui/material';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { CurrencyFormat } from '../../shared/enums/currencyFormat';
import { InvoiceStatus } from '../../shared/enums/invoiceStatus';
import { Themes } from '../../shared/enums/themes';
import type { Invoice } from '../../shared/types/invoice';
import { formatDate, getFormattedCurrency } from '../../shared/utils/functions';
import { useAppSelector } from '../../state/configureStore';
import { selectSettings } from '../../state/pageSlice';

interface Props {
  item: Invoice;
  selectedItem?: Invoice;
  onEdit: (item: Invoice) => void;
  onDelete: (id: number) => void;
}
export const List: FC<Props> = ({ item, selectedItem, onEdit, onDelete }) => {
  const settings = useAppSelector(selectSettings);
  const theme = useTheme();
  const { t } = useTranslation();

  const getTotalAmountPaid = (): number => {
    if (!item.invoicePayments || item.invoicePayments.length === 0) {
      return 0;
    }

    const totalCents = item.invoicePayments.reduce((sum, p) => sum + p.amountCents, 0);
    return totalCents;
  };

  const getLastPaymentDate = (): string | null => {
    if (!item.invoicePayments || item.invoicePayments.length === 0) {
      return null;
    }

    return item.invoicePayments.reduce((latest, payment) => {
      const latestTime = new Date(latest).getTime();
      const paymentTime = new Date(payment.paidAt).getTime();
      return paymentTime > latestTime ? payment.paidAt : latest;
    }, item.invoicePayments[0].paidAt);
  };

  const daysLeft = () => {
    if (!item.dueDate) return 0;

    const d = typeof item.dueDate === 'string' ? parseISO(item.dueDate) : item.dueDate;

    const due = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    return differenceInCalendarDays(due, todayDateOnly);
  };

  const getColor = () => {
    if (item.state === InvoiceStatus.partiallyPaid) return theme.palette.warning.main;
    if (item.state === InvoiceStatus.paid) return theme.palette.success.main;
    if (item.state === InvoiceStatus.unpaid) return theme.palette.error.main;
    if (item.state === InvoiceStatus.canceled || item.isArchived) return theme.palette.grey[700];

    return theme.palette.divider;
  };

  const latestPaidAt = useMemo(() => getLastPaymentDate(), [item.invoicePayments]);
  const overdueDaysLeft = useMemo(() => daysLeft(), [item]);
  const amountPaidCents = useMemo(() => getTotalAmountPaid(), [item.invoicePayments]);
  const totalAmountCents = useMemo(() => 200 * item.currencySubunitSnapshot, [item]);
  const remainingCents = useMemo(() => totalAmountCents - amountPaidCents, [amountPaidCents, totalAmountCents]);
  const remainingAmount = useMemo(() => remainingCents / item.currencySubunitSnapshot, [remainingCents]);
  const totalAmount = useMemo(() => totalAmountCents / item.currencySubunitSnapshot, [totalAmountCents]);

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          position: 'relative',
          borderLeft: '3px solid',
          boxShadow: 1,
          borderLeftColor: getColor(),
          bgcolor:
            item.id === selectedItem?.id
              ? theme.palette.mode === Themes.dark
                ? darken(theme.palette.primary.main, 0.9)
                : lighten(theme.palette.primary.main, 0.9)
              : theme.palette.background.paper,
          transition: '0.25s',
          overflow: 'unset'
        }}
      >
        <CardActionArea>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1,
                  justifyContent: 'space-between'
                }}
              >
                <Typography
                  color={theme.palette.text.secondary}
                  component="div"
                  variant="body1"
                  sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {settings && formatDate(item.issuedAt, settings.dateFormat)}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: getColor(),
                      flexShrink: 0
                    }}
                  />
                  <Typography
                    color={theme.palette.text.secondary}
                    component="div"
                    variant="body1"
                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {item.isArchived ? t('common.archived').toUpperCase() : item.state?.toUpperCase()}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1,
                  justifyContent: 'space-between'
                }}
              >
                <Typography
                  component="div"
                  variant="body1"
                  sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {item.clientNameSnapshot}
                </Typography>

                {settings && (
                  <Typography
                    component="div"
                    variant="body1"
                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {getFormattedCurrency({
                      amount: totalAmount,
                      amountFormat: settings.amountFormat,
                      format: item.currencyFormat as CurrencyFormat,
                      symbol: item.currencySymbolSnapshot,
                      code: item.currencyCodeSnapshot
                    })}
                  </Typography>
                )}
              </Box>

              {item.dueDate && settings && (
                <>
                  {overdueDaysLeft > 0 && (
                    <Typography
                      color={theme.palette.warning.main}
                      component="div"
                      variant="body2"
                      fontSize={'small'}
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {t('invoices.dueDate', {
                        days: overdueDaysLeft,
                        date: formatDate(item.dueDate, settings.dateFormat)
                      })}
                    </Typography>
                  )}
                  {overdueDaysLeft < 0 && (
                    <Typography
                      color={theme.palette.error.main}
                      component="div"
                      variant="body2"
                      fontSize={'small'}
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {t('invoices.overdue', {
                        days: Math.abs(overdueDaysLeft)
                      })}
                    </Typography>
                  )}
                  {overdueDaysLeft === 0 && (
                    <Typography
                      color={theme.palette.warning.main}
                      component="div"
                      variant="body2"
                      fontSize={'small'}
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {t('invoices.dueToday', {
                        date: formatDate(item.dueDate, settings.dateFormat)
                      })}
                    </Typography>
                  )}
                </>
              )}
              {item.state === InvoiceStatus.paid && latestPaidAt && settings && (
                <>
                  <Typography
                    color={theme.palette.success.main}
                    component="div"
                    variant="body2"
                    fontSize={'small'}
                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {t('invoices.markedAsPaid', {
                      date: formatDate(latestPaidAt, settings.dateFormat)
                    })}
                  </Typography>
                  {remainingAmount < 0 && (
                    <Typography
                      color={theme.palette.info.main}
                      component="div"
                      variant="body2"
                      fontSize={'small'}
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {t('invoices.overpaid', {
                        amount: getFormattedCurrency({
                          amount: Math.abs(remainingAmount),
                          amountFormat: settings.amountFormat,
                          format: item.currencyFormat as CurrencyFormat,
                          symbol: item.currencySymbolSnapshot,
                          code: item.currencyCodeSnapshot
                        })
                      })}
                    </Typography>
                  )}
                </>
              )}
              {item.state === InvoiceStatus.partiallyPaid && latestPaidAt && settings && (
                <Typography
                  color={theme.palette.info.main}
                  component="div"
                  variant="body2"
                  fontSize={'small'}
                  sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {t('invoices.partiallyPaid', {
                    amount: getFormattedCurrency({
                      amount: remainingAmount,
                      amountFormat: settings.amountFormat,
                      format: item.currencyFormat as CurrencyFormat,
                      symbol: item.currencySymbolSnapshot,
                      code: item.currencyCodeSnapshot
                    })
                  })}
                </Typography>
              )}
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </>
  );
};
