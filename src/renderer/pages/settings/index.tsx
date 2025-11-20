import { Grid, useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Content } from '../../components/content/Content';
import { NoItem } from '../../components/noItem/NoItem';
import type { AmountFormat } from '../../enums/amountFormat';
import type { DateFormat } from '../../enums/dateFormat';
import type { Language } from '../../enums/language';
import { MenuItemSettings } from '../../enums/menuItemSettings';
import { useSettingsUpdate } from '../../hooks/settings/useSettingsUpdate';
import i18n from '../../i18n';
import { useAppDispatch, useAppSelector } from '../../state/configureStore';
import {
  addToast,
  selectSettings,
  setCardOverviews,
  setCustomInvoiseSettings,
  setLanguageDate,
  setMode,
  setQuotes,
  setReports
} from '../../state/pageSlice';
import type { Response } from '../../types/response';
import { CustomizeInvoice } from './content/CustomizeInvoice';
import { LanguageFormat } from './content/LanguageFormat';
import { Menu } from './menu/Menu';

export const SettingsPage = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItemSettings | undefined>(undefined);
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const dispatch = useAppDispatch();
  const storeSettings = useAppSelector(selectSettings);
  const hasInitialized = useRef(false);
  const stableSettings = useMemo(() => storeSettings ?? {}, [storeSettings]);
  const { execute } = useSettingsUpdate({
    newSettings: stableSettings ?? {},
    immediate: false,
    onDone: (data: Response<unknown>) => {
      if (!data.success) {
        if (data.message) dispatch(addToast({ message: data.message, severity: 'error' }));
        else if (data.key) dispatch(addToast({ message: t(data.key), severity: 'error' }));
      }
    }
  });

  const onModeChange = useCallback(
    (isDark: boolean) => {
      dispatch(setMode(isDark));
    },
    [dispatch]
  );

  const toggleQuotes = useCallback(
    (value: boolean) => {
      dispatch(setQuotes(value));
    },
    [dispatch]
  );

  const toggleReports = useCallback(
    (value: boolean) => {
      dispatch(setReports(value));
    },
    [dispatch]
  );

  const toggleCardOverviews = useCallback(
    (value: boolean) => {
      dispatch(setCardOverviews(value));
    },
    [dispatch]
  );

  const onCustomizedInvoice = useCallback(
    (data: {
      suffix?: string;
      prefix?: string;
      includeMonth: boolean;
      includeYear: boolean;
      includeBusinessName: boolean;
    }) => {
      dispatch(
        setCustomInvoiseSettings({
          invoicePrefix: data.prefix,
          invoiceSuffix: data.suffix,
          shouldIncludeMonth: data.includeMonth,
          shouldIncludeYear: data.includeYear,
          shouldIncludeBusinessName: data.includeBusinessName
        })
      );
    },
    [dispatch]
  );

  const onLanguageFormat = useCallback(
    (data: { language: Language; amountFormat: AmountFormat; dateFormat: DateFormat }) => {
      i18n.changeLanguage(data.language);
      localStorage.setItem('lastUsedLanguage', data.language);

      dispatch(
        setLanguageDate({
          language: data.language,
          amountFormat: data.amountFormat,
          dateFormat: data.dateFormat
        })
      );
    },
    [dispatch]
  );

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }

    execute();
  }, [stableSettings, execute]);

  const onSelected = useCallback((item: MenuItemSettings | undefined) => {
    setCurrentMenuItem(item);
  }, []);

  const onBack = useCallback(() => {
    setCurrentMenuItem(undefined);
  }, []);

  let rightColumn: ReactNode;
  if (typeof currentMenuItem === 'undefined') {
    rightColumn = <NoItem text={t('app.noItems')} />;
  } else {
    switch (currentMenuItem) {
      case MenuItemSettings.Receipt:
        rightColumn = (
          <CustomizeInvoice onCustomizedInvoice={onCustomizedInvoice} showBack={!isDesktop} onBack={onBack} />
        );
        break;
      case MenuItemSettings.LanguageFormat:
        rightColumn = <LanguageFormat onLanguageFormat={onLanguageFormat} showBack={!isDesktop} onBack={onBack} />;
        break;
      default:
        rightColumn = <NoItem text={t('app.noItems')} />;
        break;
    }
  }

  const leftColumnMenu = (
    <Menu
      onSelected={onSelected}
      selectedMenu={currentMenuItem}
      onModeChange={onModeChange}
      toggleQuotes={toggleQuotes}
      toggleReports={toggleReports}
      toggleCardOverviews={toggleCardOverviews}
    />
  );

  return (
    <Grid container component="div" spacing={2} justifyContent="center" alignItems="stretch" sx={{ height: '100%' }}>
      {isDesktop ? (
        <>
          {leftColumnMenu}
          <Content node={rightColumn} />
        </>
      ) : (
        <>{typeof currentMenuItem === 'undefined' ? leftColumnMenu : <Content node={rightColumn} />}</>
      )}
    </Grid>
  );
};
