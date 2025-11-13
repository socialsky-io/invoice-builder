import { Grid, useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AmountFormat } from '../../enums/amountFormat';
import type { DateFormat } from '../../enums/dateFormat';
import type { Language } from '../../enums/language';
import { MenuItem } from '../../enums/menuItem';
import { useSettingsUpdate } from '../../hooks/settings/useSettingsUpdate';
import i18n from '../../i18n';
import { useAppDispatch, useAppSelector } from '../../state/configureStore';
import {
  selectSettings,
  setCardOverviews,
  setCustomInvoiseSettings,
  setLanguageDate,
  setMode,
  setQuates,
  setReports
} from '../../state/pageSlice';
import { Content } from './content/Content';
import { CustomizeInvoice } from './content/CustomizeInvoice';
import { LanguageFormat } from './content/LanguageFormat';
import { NoItem } from './content/NoItem';
import { Menu } from './menu/Menu';

export const SettingsPage = () => {
  const theme = useTheme();
  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | undefined>(undefined);
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const dispatch = useAppDispatch();
  const storeSettings = useAppSelector(selectSettings);
  const hasInitialized = useRef(false);
  const stableSettings = useMemo(() => storeSettings ?? {}, [storeSettings]);
  const { execute } = useSettingsUpdate({ newSettings: stableSettings ?? {}, immediate: false });

  const onModeChange = useCallback(
    (isDark: boolean) => {
      dispatch(setMode(isDark));
    },
    [dispatch]
  );

  const toggleQuates = useCallback(
    (value: boolean) => {
      dispatch(setQuates(value));
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

  const onSelected = useCallback((item: MenuItem | undefined) => {
    setCurrentMenuItem(item);
  }, []);

  const onBack = useCallback(() => {
    setCurrentMenuItem(undefined);
  }, []);

  let rightColumn: ReactNode;
  if (typeof currentMenuItem === 'undefined') {
    rightColumn = <NoItem />;
  } else {
    switch (currentMenuItem) {
      case MenuItem.Receipt:
        rightColumn = (
          <CustomizeInvoice onCustomizedInvoice={onCustomizedInvoice} showBack={!isDesktop} onBack={onBack} />
        );
        break;
      case MenuItem.LanguageFormat:
        rightColumn = <LanguageFormat onLanguageFormat={onLanguageFormat} showBack={!isDesktop} onBack={onBack} />;
        break;
      default:
        rightColumn = <NoItem />;
        break;
    }
  }

  return (
    <Grid container component="div" spacing={2} justifyContent="center" alignItems="stretch" sx={{ height: '100%' }}>
      {isDesktop ? (
        <>
          <Menu
            onSelected={onSelected}
            selectedMenu={currentMenuItem}
            onModeChange={onModeChange}
            toggleQuates={toggleQuates}
            toggleReports={toggleReports}
            toggleCardOverviews={toggleCardOverviews}
          />
          <Content node={rightColumn} />
        </>
      ) : (
        <>
          {typeof currentMenuItem === 'undefined' ? (
            <Menu
              onSelected={onSelected}
              selectedMenu={currentMenuItem}
              onModeChange={onModeChange}
              toggleQuates={toggleQuates}
              toggleReports={toggleReports}
              toggleCardOverviews={toggleCardOverviews}
            />
          ) : (
            <Content node={rightColumn} />
          )}
        </>
      )}
    </Grid>
  );
};
