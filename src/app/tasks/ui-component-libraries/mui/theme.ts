import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: { main: '#60a5fa' },
    background: { default: '#0a0a0a', paper: '#171717' },
    text: { primary: '#f5f5f5', secondary: '#a3a3a3' },
    divider: 'rgba(255, 255, 255, 0.1)',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
  },
});

export default theme;
