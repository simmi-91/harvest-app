import { createTheme } from '@mui/material/styles';

const gardenTheme = createTheme({
  palette: {
    primary: {
      main: '#99ac73',
      light: '#fff',
      dark: '#242524',
      contrastText: '#242524',
    },
    secondary: {
      main: '#f9c7d4',
      light: '#fff',
      dark: '#242524',
      contrastText: '#242524',
    },
    contrast: {
      light: '#f0a78f',
      main: '#d95d39',
      dark: '#aa4c32',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiOutlinedInput:{
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    }
  },
});

export default gardenTheme;