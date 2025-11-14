import { DarkMode, Description, FileDownload, Language, LightMode } from '@mui/icons-material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InfoIcon from '@mui/icons-material/Info';
import PolicyIcon from '@mui/icons-material/Policy';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShareIcon from '@mui/icons-material/Share';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Box, Card, CardContent, Grid, Typography, useTheme } from '@mui/material';
import { useContext, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuList } from '../../../components/menuList/MenuList';
import { ThemeContext } from '../../../components/theme/ThemeProviderWrapper';
import { MenuItemSettings } from '../../../enums/menuItemSettings';
import { Themes } from '../../../enums/themes';
import { useAppSelector } from '../../../state/configureStore';
import { selectSettings } from '../../../state/pageSlice';

interface Props {
  onSelected?: (key: MenuItemSettings | undefined) => void;
  selectedMenu?: MenuItemSettings | undefined;
  onModeChange?: (isDark: boolean) => void;
  toggleQuates?: (value: boolean) => void;
  toggleReports?: (value: boolean) => void;
  toggleCardOverviews?: (value: boolean) => void;
}
export const Menu: FC<Props> = ({
  onSelected = () => {},
  selectedMenu,
  toggleQuates = () => {},
  toggleReports = () => {},
  toggleCardOverviews = () => {},
  onModeChange = () => {}
}) => {
  const { mode, toggleMode } = useContext(ThemeContext);
  const { t } = useTranslation();
  const theme = useTheme();
  const storeSettings = useAppSelector(selectSettings);

  const personalization = [
    {
      text: t('settingsMenuItems.titles.languageFormat'),
      description: t('settingsMenuItems.descriptions.languageFormat'),
      icon: <Language />,
      isToggle: false,
      isSelected: MenuItemSettings.LanguageFormat === selectedMenu,
      onClick: () => onSelected(MenuItemSettings.LanguageFormat)
    },
    {
      text: t('settingsMenuItems.titles.customizeInvoice'),
      description: t('settingsMenuItems.descriptions.customizeInvoice'),
      icon: <Description />,
      isToggle: false,
      isSelected: MenuItemSettings.Receipt === selectedMenu,
      onClick: () => onSelected(MenuItemSettings.Receipt)
    },
    {
      text: t('settingsMenuItems.titles.darkMode'),
      description: t('settingsMenuItems.descriptions.darkMode'),
      icon: mode === Themes.light ? <DarkMode /> : <LightMode />,
      isToggle: true,
      isSelected: false,
      checked: mode === Themes.dark,
      onChange: () => {
        toggleMode();
        onModeChange(mode === Themes.light);
      }
    }
  ];

  const featureToggles = [
    {
      text: t('settingsMenuItems.titles.turnQuates'),
      description: t('settingsMenuItems.descriptions.turnQuates'),
      icon: <ReceiptIcon />,
      isToggle: true,
      isSelected: false,
      checked: storeSettings?.quatesON ?? true,
      onChange: () => {
        toggleQuates(!storeSettings?.quatesON);
      }
    },
    {
      text: t('settingsMenuItems.titles.turnReports'),
      description: t('settingsMenuItems.descriptions.turnReports'),
      icon: <AssessmentIcon />,
      isToggle: true,
      isSelected: false,
      checked: storeSettings?.reportsON ?? true,
      onChange: () => {
        toggleReports(!storeSettings?.reportsON);
      }
    },
    {
      text: t('settingsMenuItems.titles.turnCardOverviews'),
      description: t('settingsMenuItems.descriptions.turnCardOverviews'),
      icon: <DashboardIcon />,
      isToggle: true,
      isSelected: false,
      checked: storeSettings?.overviewCardsON ?? true,
      onChange: () => {
        toggleCardOverviews(!storeSettings?.overviewCardsON);
      }
    }
  ];

  const appManagement = [
    {
      text: t('settingsMenuItems.titles.import'),
      description: t('settingsMenuItems.descriptions.import'),
      icon: <UploadFileIcon />,
      isSelected: false,
      isToggle: false
    },
    {
      text: t('settingsMenuItems.titles.export'),
      description: t('settingsMenuItems.descriptions.export'),
      icon: <FileDownload />,
      isSelected: false,
      isToggle: false
    },
    {
      text: t('settingsMenuItems.titles.share'),
      description: t('settingsMenuItems.descriptions.share'),
      icon: <ShareIcon />,
      isSelected: false,
      isToggle: false,
      onClick: () => {
        window.electronAPI.openUrl('https://github.com/piratuks/invoice-builder');
      }
    },
    {
      text: t('settingsMenuItems.titles.support'),
      description: t('settingsMenuItems.descriptions.support'),
      icon: <SupportAgentIcon />,
      isSelected: false,
      isToggle: false,
      onClick: () => {
        window.electronAPI.openUrl('https://github.com/piratuks/invoice-builder/issues');
      }
    },
    {
      text: t('settingsMenuItems.titles.privacyPolicy'),
      description: t('settingsMenuItems.descriptions.privacyPolicy'),
      icon: <PolicyIcon />,
      isSelected: false,
      isToggle: false,
      onClick: () => {
        window.electronAPI.openUrl('https://github.com/piratuks/invoice-builder/PRIVACY-POLICY.md');
      }
    },
    {
      text: t('settingsMenuItems.titles.tutorial'),
      description: t('settingsMenuItems.descriptions.tutorial'),
      icon: <PolicyIcon />,
      isSelected: false,
      isToggle: false,
      onClick: () => {
        window.electronAPI.openUrl('https://github.com/piratuks/invoice-builder/TUTORIAL.md');
      }
    },
    {
      text: t('settingsMenuItems.titles.about'),
      description: t('settingsMenuItems.descriptions.about'),
      icon: <InfoIcon />,
      isToggle: false,
      isSelected: false,
      onClick: () => {
        window.electronAPI.openUrl('https://github.com/piratuks/invoice-builder/TERMS-OF-USE.md');
      }
    }
  ];

  return (
    <Grid size={{ xs: 12, md: 4 }} component="div">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{
            color: theme.palette.secondary.main
          }}
        >
          {t('menuItems.settings')}
        </Typography>
        <Card>
          <CardContent>
            <MenuList useTooltip={false} items={personalization} showText={true} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <MenuList useTooltip={false} items={featureToggles} showText={true} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <MenuList useTooltip={false} items={appManagement} showText={true} />
          </CardContent>
        </Card>
      </Box>
    </Grid>
  );
};
