import { createTheme, type ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    customBorder?: string;
  }
  interface PaletteOptions {
    customBorder?: string;
  }
}

const commonSettings: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: '2rem' },
    h2: { fontWeight: 600, fontSize: '1.75rem' },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '&::-webkit-scrollbar': {
            width: '10px',
            height: '10px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#2c2c2c',
            borderRadius: '5px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#1976d2',
            borderRadius: '5px',
            border: '2px solid #2c2c2c'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#115293'
          },
          scrollbarWidth: 'thin',
          scrollbarColor: '#1976d2 #2c2c2c'
        }
      }
    }
  }
};

export const lightTheme = createTheme({
  ...commonSettings,
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    background: {
      default: '#f5f6fa',
      paper: '#ffffff'
    },
    text: {
      primary: '#1e1e1e',
      secondary: '#555'
    },
    customBorder: '#e0e0e0'
  }
});

export const darkTheme = createTheme({
  ...commonSettings,
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#ce93d8' },
    background: {
      default: '#121212',
      paper: '#1e1e1e'
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0'
    },
    customBorder: '#333'
  }
});
