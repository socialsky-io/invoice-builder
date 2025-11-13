import { CssBaseline, ThemeProvider } from '@mui/material';
import React, { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Themes } from '../../enums/themes';
import { useAppSelector } from '../../state/configureStore';
import { selectSettings } from '../../state/pageSlice';
import { darkTheme, lightTheme } from './theme';

type ThemeMode = Themes;

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: Themes.light,
  toggleMode: () => {}
});

export const ThemeProviderWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(Themes.light);
  const storeSettings = useAppSelector(selectSettings);

  useEffect(() => {
    const isDarkMode = storeSettings?.isDarkMode;
    if (typeof isDarkMode !== undefined) {
      const saved = isDarkMode ? Themes.dark : Themes.light;
      setMode(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? Themes.dark : Themes.light);
    }
  }, [storeSettings]);

  const toggleMode = () => {
    const next = mode === Themes.light ? Themes.dark : Themes.light;

    setMode(next);
  };

  const theme = useMemo(() => (mode === Themes.light ? lightTheme : darkTheme), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
