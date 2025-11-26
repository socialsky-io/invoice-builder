import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, Divider, Fab, ListItemButton, ListItemText, Tooltip, Typography, useTheme } from '@mui/material';
import { formatDate } from 'date-fns';
import { useCallback, useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { InvoiceInfo } from '../../../main/types/invoice';
import { InvoiceStatus } from '../../shared/enums/invoiceStatus';
import { InvoiceType } from '../../shared/enums/invoiceType';
import type { Business } from '../../shared/types/business';
import type { Client } from '../../shared/types/client';
import type { Currency } from '../../shared/types/currency';
import type { Invoice, InvoiceFromData } from '../../shared/types/invoice';
import { fromUint8Array } from '../../shared/utils/dataUrlFunctions';
import { useAppSelector } from '../../state/configureStore';
import { selectSettings } from '../../state/pageSlice';
import { BusinessesDropdown } from './Dropdowns/BusinessesDropdown';
import { ClientsDropdown } from './Dropdowns/ClientsDropdown';
import { CurrenciesDropdown } from './Dropdowns/CurrenciesDropdown';
import { InvoiceInformationDropdown } from './Dropdowns/InvoiceInformationDropdown';
import { MoreActionDropdown } from './Dropdowns/MoreActionDropdown';

interface Props {
  invoice?: Invoice;
  type: InvoiceType;
  handleChange?: (data: { invoice: InvoiceFromData; isFormValid: boolean }) => void;
  handleDelete?: (id: number) => void;
  handleDuplicate?: (id: number, invoiceType: InvoiceType) => void;
}
export const Form: FC<Props> = ({
  type,
  handleChange = () => {},
  invoice,
  handleDelete = () => {},
  handleDuplicate = () => {}
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const storeSettings = useAppSelector(selectSettings);

  const [isDropdownOpenBusinesses, setIsDropdownOpenBusinesses] = useState<boolean>(false);
  const [isDropdownOpenCurrencies, setIsDropdownOpenCurrencies] = useState<boolean>(false);
  const [isDropdownOpenClients, setIsDropdownOpenClients] = useState<boolean>(false);
  const [isDropdownInvoiceInfo, setIsDropdownOpenInvoiceInfo] = useState<boolean>(false);
  const [isDropdownMoreAction, setMoreActionDropdown] = useState<boolean>(false);

  const [invoiceForm, setInvoiceForm] = useState<InvoiceFromData | undefined>(undefined);
  const [isFormValid, setIsFormValid] = useState(false);

  const onEdit = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(true);
  };

  const handleOnOpen = useCallback((setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(true);
  }, []);

  const handleOnClose = useCallback((setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(false);
  }, []);

  const checkFormValid = useCallback(() => {
    if (
      invoiceForm?.businessId !== undefined &&
      invoiceForm?.clientId !== undefined &&
      invoiceForm?.currencyId !== undefined &&
      invoiceForm?.issuedAt !== undefined &&
      invoiceForm?.invoiceNumber !== undefined
    ) {
      setIsFormValid(true);
    } else {
      setIsFormValid(true);
    }
  }, [invoiceForm]);

  const handleOnClickBusiness = useCallback(
    (data: Business) => {
      handleOnClose(setIsDropdownOpenBusinesses);
      if (invoiceForm?.businessId !== data.id) {
        setInvoiceForm({
          ...invoiceForm,
          businessId: data.id,
          businessNameSnapshot: data.name,
          businessDescriptionSnapshot: data.description,
          businessAddressSnapshot: data.address,
          businessRoleSnapshot: data.role,
          businessShortName: data.shortName,
          businessEmailSnapshot: data.email,
          businessPhoneSnapshot: data.phone,
          businessWebsiteSnapshot: data.website,
          businessAdditionalSnapshot: data.additional,
          businessPaymentInformationSnapshot: data.paymentInformation,
          businessLogoSnapshot: fromUint8Array(data.logo, data.fileType),
          businessFileSizeSnapshot: data.fileSize,
          businessFileTypeSnapshot: data.fileType,
          businessFileNameSnapshot: data.fileName
        });
      }
    },
    [handleOnClose, invoiceForm]
  );

  const handleOnClickCurrencies = useCallback(
    (data: Currency) => {
      handleOnClose(setIsDropdownOpenCurrencies);

      if (invoiceForm?.currencyId !== data.id) {
        setInvoiceForm({
          ...invoiceForm,
          currencyId: data.id,
          currencyCodeSnapshot: data.code,
          currencySymbolSnapshot: data.symbol,
          currencySubunitSnapshot: data.subunit
        });
      }
    },
    [handleOnClose, invoiceForm]
  );

  const handleOnClickClients = useCallback(
    (data: Client) => {
      handleOnClose(setIsDropdownOpenClients);

      if (invoiceForm?.clientId !== data.id) {
        setInvoiceForm({
          ...invoiceForm,
          clientId: data.id,
          clientShortName: data.shortName,
          clientNameSnapshot: data.name,
          clientAddressSnapshot: data.address,
          clientDescriptionSnapshot: data.description,
          clientEmailSnapshot: data.email,
          clientPhoneSnapshot: data.phone,
          clientCodeSnapshot: data.code,
          clientAdditionalSnapshot: data.additional
        });
      }
    },
    [handleOnClose, invoiceForm]
  );

  const handleOnClickInvoiceInformation = useCallback(
    (data: InvoiceInfo) => {
      handleOnClose(setIsDropdownOpenInvoiceInfo);
      setInvoiceForm({
        ...invoiceForm,
        issuedAt: data.issuedAt ?? '',
        invoiceNumber: data.invoiceNumber ?? '',
        dueDate: data.dueDate,
        invoicePrefixSnapshot: data.invoicePrefix,
        invoiceSuffixSnapshot: data.invoiceSuffix
      });
    },
    [handleOnClose, invoiceForm]
  );

  useEffect(() => {
    if (invoice) {
      setInvoiceForm({
        ...invoice,
        businessLogoSnapshot: fromUint8Array(invoice.businessLogoSnapshot, invoice.businessFileTypeSnapshot)
      });
    } else {
      setInvoiceForm({
        invoiceType: type,
        status: type === InvoiceType.quotation ? InvoiceStatus.open : InvoiceStatus.unpaid,
        taxRate: 0,
        isArchived: false,
        discountAmountCents: 0,
        discountPercent: 0,
        shippingFeeCents: 0
      });
    }
  }, [invoice, type]);

  useEffect(() => {
    checkFormValid();
  }, [invoiceForm, checkFormValid]);

  useEffect(() => {
    if (invoiceForm)
      handleChange({
        invoice: invoiceForm,
        isFormValid: isFormValid
      });
  }, [invoiceForm, isFormValid, handleChange]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        gap: 2
      }}
    >
      <Divider flexItem />

      <Box sx={{ width: 'fit-content' }}>
        <ListItemButton
          onClick={() => onEdit(setIsDropdownOpenCurrencies)}
          sx={{
            pt: 2,
            pb: 2,
            pl: 2,
            pr: 2,
            borderRadius: 1
          }}
        >
          <ListItemText
            primary={
              <Typography
                component="div"
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {t('currencies.title').toUpperCase()}
              </Typography>
            }
            secondary={
              invoiceForm?.currencyCodeSnapshot &&
              invoiceForm?.currencySymbolSnapshot && (
                <Typography
                  component="div"
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {invoiceForm.currencyCodeSnapshot} / {invoiceForm.currencySymbolSnapshot}
                </Typography>
              )
            }
            disableTypography
            sx={{ m: 0 }}
            slotProps={{ primary: { sx: { fontWeight: 500, m: 0 } } }}
          />
        </ListItemButton>
      </Box>

      <Divider flexItem />

      <ListItemButton
        onClick={() => onEdit(setIsDropdownOpenBusinesses)}
        sx={{
          pt: 2,
          pb: 2,
          pl: 2,
          pr: 2,
          width: '100%',
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'start',
          flexDirection: 'column'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'start',
            alignItems: 'center',
            width: '100%',
            gap: 2
          }}
        >
          <ListItemText
            primary={
              <Typography
                component="div"
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {t('businesses.title').toUpperCase()}
              </Typography>
            }
            secondary={
              <Typography
                component="div"
                variant="body2"
                sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {invoiceForm?.businessNameSnapshot}
              </Typography>
            }
            disableTypography
            sx={{ m: 0 }}
            slotProps={{ primary: { sx: { fontWeight: 500, m: 0 } } }}
          />
          {invoiceForm?.businessLogoSnapshot ? (
            <img
              src={invoiceForm.businessLogoSnapshot}
              alt={t('invoices.businessLogo')}
              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
            />
          ) : (
            <Box
              sx={{
                width: '60px',
                height: '60px',
                background: theme.palette.primary.main,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 1,
                fontWeight: 500,
                overflow: 'hidden'
              }}
            >
              {invoiceForm?.businessShortName}
            </Box>
          )}
        </Box>
      </ListItemButton>

      <Divider flexItem />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box sx={{ width: 'fit-content' }}>
          <ListItemButton
            onClick={() => onEdit(setIsDropdownOpenClients)}
            sx={{
              pt: 2,
              pb: 2,
              pl: 2,
              pr: 2,
              width: '100%',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'start',
              flexDirection: 'column'
            }}
          >
            <ListItemText
              primary={
                <Typography
                  component="div"
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {t('invoices.billTo').toUpperCase()}
                </Typography>
              }
              secondary={
                <Typography
                  component="div"
                  variant="body2"
                  sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {invoiceForm?.clientNameSnapshot}
                </Typography>
              }
              disableTypography
              sx={{ m: 0 }}
              slotProps={{ primary: { sx: { fontWeight: 500, m: 0 } } }}
            />
          </ListItemButton>
        </Box>
        <Box sx={{ width: 'fit-content' }}>
          <ListItemButton
            onClick={() => onEdit(setIsDropdownOpenInvoiceInfo)}
            sx={{
              pt: 2,
              pb: 2,
              pl: 2,
              pr: 2,
              width: '100%',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'start',
              flexDirection: 'column'
            }}
          >
            <ListItemText
              primary={
                <Typography
                  component="div"
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {type === InvoiceType.quotation
                    ? t('invoices.quoteInfo').toUpperCase()
                    : t('invoices.invoiceInfo').toUpperCase()}
                </Typography>
              }
              secondary={
                <>
                  <Typography
                    component="div"
                    variant="body2"
                    sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {invoiceForm?.invoicePrefixSnapshot}
                    {invoiceForm?.invoiceNumber}
                    {invoiceForm?.invoiceSuffixSnapshot}
                  </Typography>
                  {storeSettings && invoiceForm?.issuedAt && (
                    <Typography
                      component="div"
                      variant="body2"
                      sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {t('invoices.issuedAt', { date: formatDate(invoiceForm.issuedAt, storeSettings.dateFormat) })}
                    </Typography>
                  )}
                  {storeSettings && invoiceForm?.dueDate && (
                    <Typography
                      component="div"
                      variant="body2"
                      sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {t('invoices.dueDateAt', { date: formatDate(invoiceForm.dueDate, storeSettings.dateFormat) })}
                    </Typography>
                  )}
                </>
              }
              disableTypography
              sx={{ m: 0, textAlign: 'end' }}
              slotProps={{ primary: { sx: { fontWeight: 500, m: 0 } } }}
            />
          </ListItemButton>
        </Box>
      </Box>

      <BusinessesDropdown
        isOpen={isDropdownOpenBusinesses}
        onClose={() => handleOnClose(setIsDropdownOpenBusinesses)}
        onOpen={() => handleOnOpen(setIsDropdownOpenBusinesses)}
        onClick={handleOnClickBusiness}
      />
      <CurrenciesDropdown
        isOpen={isDropdownOpenCurrencies}
        onClose={() => handleOnClose(setIsDropdownOpenCurrencies)}
        onOpen={() => handleOnOpen(setIsDropdownOpenCurrencies)}
        onClick={handleOnClickCurrencies}
      />
      <ClientsDropdown
        isOpen={isDropdownOpenClients}
        onClose={() => handleOnClose(setIsDropdownOpenClients)}
        onOpen={() => handleOnOpen(setIsDropdownOpenClients)}
        onClick={handleOnClickClients}
      />
      <InvoiceInformationDropdown
        information={{
          id: invoiceForm?.id,
          issuedAt: invoiceForm?.issuedAt,
          invoiceNumber: invoiceForm?.invoiceNumber,
          dueDate: invoiceForm?.dueDate,
          invoicePrefix: invoiceForm?.invoicePrefixSnapshot,
          invoiceSuffix: invoiceForm?.invoiceSuffixSnapshot
        }}
        isOpen={isDropdownInvoiceInfo}
        onClose={() => handleOnClose(setIsDropdownOpenInvoiceInfo)}
        onOpen={() => handleOnOpen(setIsDropdownOpenInvoiceInfo)}
        onClick={handleOnClickInvoiceInformation}
      />
      <MoreActionDropdown
        isOpen={isDropdownMoreAction}
        onClose={() => handleOnClose(setMoreActionDropdown)}
        onOpen={() => handleOnOpen(setMoreActionDropdown)}
        onDelete={() => {
          if (invoiceForm?.id !== undefined) handleDelete(invoiceForm.id);
        }}
        onDuplicate={() => {
          if (invoiceForm?.id !== undefined) handleDuplicate(invoiceForm.id, type);
        }}
        onMakeInvoice={() => {
          if (invoiceForm?.id !== undefined) handleDuplicate(invoiceForm.id, InvoiceType.invoice);
        }}
        showDelete={invoiceForm?.id !== undefined}
        showDuplicate={invoiceForm?.id !== undefined}
        showMakeInvoice={invoiceForm?.id !== undefined && invoiceForm.invoiceType === InvoiceType.quotation}
        onExport={() => {}}
      />

      <Tooltip title={t('ariaLabel.moreActions')}>
        <Fab
          color="primary"
          aria-label={t('ariaLabel.moreActions')}
          onClick={() => handleOnOpen(setMoreActionDropdown)}
          sx={{
            position: 'fixed',
            bottom: 40,
            right: 40,
            zIndex: 1000
          }}
        >
          <MoreVertIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};
