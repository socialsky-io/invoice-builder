import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, Divider, Fab, Tooltip } from '@mui/material';
import { useCallback, useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { InvoiceInfo } from '../../../main/types/invoice';
import { InvoiceStatus } from '../../shared/enums/invoiceStatus';
import { InvoiceType } from '../../shared/enums/invoiceType';
import type { Business } from '../../shared/types/business';
import type { Client } from '../../shared/types/client';
import type { Currency } from '../../shared/types/currency';
import type { Invoice, InvoiceFromData, InvoiceItem } from '../../shared/types/invoice';
import type { Item } from '../../shared/types/item';
import { fromUint8Array } from '../../shared/utils/dataUrlFunctions';
import { BusinessesDropdown } from './Dropdowns/BusinessesDropdown';
import { ClientsDropdown } from './Dropdowns/ClientsDropdown';
import { CurrenciesDropdown } from './Dropdowns/CurrenciesDropdown';
import { InvoiceInformationDropdown } from './Dropdowns/InvoiceInformationDropdown';
import { ItemsDropdown } from './Dropdowns/ItemsDropdown';
import { MoreActionDropdown } from './Dropdowns/MoreActionDropdown';
import { BusinessSelector } from './Form/BusinessSelector';
import { ClientInvoiceRow } from './Form/ClientInvoiceRow';
import { CurrencySelector } from './Form/CurrencySelector';
import { ItemSelector } from './Form/ItemSelector';
import { ItemsList } from './Form/ItemsList';
import { ItemQuantitySetter } from './Modals/ItemQuantitySetter';

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

  const [isDropdownOpenBusinesses, setIsDropdownOpenBusinesses] = useState<boolean>(false);
  const [isDropdownOpenCurrencies, setIsDropdownOpenCurrencies] = useState<boolean>(false);
  const [isDropdownOpenClients, setIsDropdownOpenClients] = useState<boolean>(false);
  const [isDropdownInvoiceInfo, setIsDropdownOpenInvoiceInfo] = useState<boolean>(false);
  const [isDropdownMoreAction, setMoreActionDropdown] = useState<boolean>(false);
  const [isDropdownItems, setIsDropdownOpenItems] = useState<boolean>(false);
  const [isModalQuantityOpen, setModalQuantityOpen] = useState<boolean>(false);

  const [invoiceForm, setInvoiceForm] = useState<InvoiceFromData | undefined>(undefined);
  const [isFormValid, setIsFormValid] = useState(false);

  const [selectedInvoiceItem, setSelectedInvoiceItem] = useState<InvoiceItem | undefined>(undefined);

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
      setIsFormValid(false);
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
        if (!invoiceForm) return;

        const prevSubunit = invoiceForm.currencySubunitSnapshot;
        const newSubunit = data.subunit;

        const updatedItems = invoiceForm.invoiceItems?.map(it => {
          const raw = Number(it.unitPriceCentsSnapshot ?? 0);

          let converted = raw;

          if (prevSubunit === undefined && newSubunit !== undefined) {
            converted = raw * newSubunit;
          } else if (prevSubunit !== undefined && newSubunit !== undefined) {
            converted = raw * (newSubunit / prevSubunit);
          } else if (prevSubunit !== undefined && newSubunit === undefined) {
            converted = raw / prevSubunit;
          }

          return {
            ...it,
            unitPriceCentsSnapshot: converted
          };
        });

        setInvoiceForm({
          ...invoiceForm,
          currencyId: data.id,
          currencyCodeSnapshot: data.code,
          currencySymbolSnapshot: data.symbol,
          currencySubunitSnapshot: data.subunit,
          currencyFormat: data.format,
          invoiceItems: updatedItems ?? invoiceForm.invoiceItems
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

  const handleClickItems = useCallback(
    (data: Item, quantity: number) => {
      handleOnClose(setIsDropdownOpenItems);

      if (!invoiceForm) return;

      const amount = Number(data.amount ?? 0);
      const unitPrice = invoiceForm.currencySubunitSnapshot ? amount * invoiceForm.currencySubunitSnapshot : amount;

      const newItem = {
        id: Date.now(),
        itemId: data.id,
        itemNameSnapshot: data.name,
        categoryNameSnapshot: data.categoryName,
        unitNameSnapshot: data.unitName,
        itemDescriptionSnapshot: data.description,
        unitPriceCentsSnapshot: unitPrice,
        quantity: quantity,
        taxName: undefined,
        taxRate: 0,
        taxType: undefined
      };

      setInvoiceForm(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          invoiceItems: [...(prev.invoiceItems ?? []), newItem]
        };
      });
    },
    [handleOnClose, invoiceForm]
  );

  const handleDeleteItem = useCallback(
    (itemToRemove: InvoiceItem) => {
      if (!invoiceForm) return;

      setInvoiceForm(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          invoiceItems: (prev.invoiceItems ?? []).filter(i => i.id !== itemToRemove.id)
        };
      });
    },
    [invoiceForm]
  );

  const handleEditItem = useCallback(
    (itemToEdit: InvoiceItem) => {
      if (!invoiceForm) return;

      setSelectedInvoiceItem(itemToEdit);
      handleOnOpen(setModalQuantityOpen);
    },
    [invoiceForm, handleOnOpen]
  );

  const handleEditQuantity = useCallback(
    (quantity: number) => {
      if (!selectedInvoiceItem || !invoiceForm) return;

      setInvoiceForm(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          invoiceItems: (prev.invoiceItems ?? []).map(item =>
            item.id === selectedInvoiceItem.id ? { ...item, quantity: quantity } : item
          )
        };
      });

      setSelectedInvoiceItem(undefined);
      handleOnClose(setModalQuantityOpen);
    },
    [invoiceForm, selectedInvoiceItem, handleOnClose, setSelectedInvoiceItem]
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
        shippingFeeCents: 0,
        invoiceItems: [],
        invoicePayments: []
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
        gap: 2
      }}
    >
      <Divider flexItem />
      <CurrencySelector onEdit={() => onEdit(setIsDropdownOpenCurrencies)} invoiceForm={invoiceForm} />
      <Divider flexItem />
      <BusinessSelector onEdit={() => onEdit(setIsDropdownOpenBusinesses)} invoiceForm={invoiceForm} />
      <Divider flexItem />
      <ClientInvoiceRow
        onEditClients={() => onEdit(setIsDropdownOpenClients)}
        onEditInvoiceInfo={() => onEdit(setIsDropdownOpenInvoiceInfo)}
        invoiceForm={invoiceForm}
        type={type}
      />

      <Divider flexItem />

      <ItemsList
        invoiceForm={invoiceForm}
        setInvoiceForm={setInvoiceForm}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
      />

      <ItemSelector onEdit={() => onEdit(setIsDropdownOpenItems)} />

      <Divider flexItem />

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
      <ItemsDropdown
        isOpen={isDropdownItems}
        onClose={() => handleOnClose(setIsDropdownOpenItems)}
        onOpen={() => handleOnOpen(setIsDropdownOpenItems)}
        onClick={handleClickItems}
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
      <ItemQuantitySetter
        isOpen={isModalQuantityOpen}
        onCancel={() => handleOnClose(setModalQuantityOpen)}
        currQuantity={selectedInvoiceItem?.quantity}
        onSave={handleEditQuantity}
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
