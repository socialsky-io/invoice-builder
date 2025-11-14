import { Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState, type FC, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Content } from '../../components/content/Content';

export const Clients: FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [currentMenuItem, setCurrentMenuItem] = useState<boolean | undefined>(undefined);
  const { t } = useTranslation();

  let rightColumn: ReactNode;
  // if (typeof currentMenuItem === 'undefined') {
  //   rightColumn = <NoItem />;
  // } else {
  //   switch (currentMenuItem) {
  //     case MenuItemSettings.Receipt:
  //       rightColumn = (
  //         <CustomizeInvoice onCustomizedInvoice={onCustomizedInvoice} showBack={!isDesktop} onBack={onBack} />
  //       );
  //       break;
  //     case MenuItemSettings.LanguageFormat:
  //       rightColumn = <LanguageFormat onLanguageFormat={onLanguageFormat} showBack={!isDesktop} onBack={onBack} />;
  //       break;
  //     default:
  //       rightColumn = <NoItem />;
  //       break;
  //   }
  // }

  return (
    <Grid container component="div" spacing={2} justifyContent="center" alignItems="stretch" sx={{ height: '100%' }}>
      {isDesktop ? (
        <>
          {/* <Menu
            onSelected={onSelected}
            selectedMenu={currentMenuItem}
            onModeChange={onModeChange}
            toggleQuates={toggleQuates}
            toggleReports={toggleReports}
            toggleCardOverviews={toggleCardOverviews}
          />*/}
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{
              color: theme.palette.secondary.main
            }}
          >
            /?dasdad {t('menuItems.settings')}
          </Typography>
          <Content node={rightColumn} />
        </>
      ) : (
        <>
          {typeof currentMenuItem === 'undefined' ? (
            // <Menu
            //   onSelected={onSelected}
            //   selectedMenu={currentMenuItem}
            //   onModeChange={onModeChange}
            //   toggleQuates={toggleQuates}
            //   toggleReports={toggleReports}
            //   toggleCardOverviews={toggleCardOverviews}
            // />
            <Typography
              variant="h5"
              noWrap
              component="div"
              sx={{
                color: theme.palette.secondary.main
              }}
            >
              /?dasdad {t('menuItems.settings')}
            </Typography>
          ) : (
            <Content node={rightColumn} />
          )}
        </>
      )}
    </Grid>
  );
};
