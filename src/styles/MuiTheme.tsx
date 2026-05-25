import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";

// Extend MUI palette to support a tertiary colour
declare module '@mui/material/styles' {
  interface Palette { tertiary: Palette['primary']; }
  interface PaletteOptions { tertiary?: PaletteOptions['primary']; }
}
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides { tertiary: true; }
}

// Brand tokens (shared with /docs/src/styles.css):
//   navy:     #232946  (primary — structure & chrome)
//   orange:   #ff6b35  (secondary — accents, stars, sidebar active)
//   teal:     #25606e  (tertiary — CTA buttons)
const canyoningTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f4f8fd',
    },
    primary: {
      main: '#232946',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#ff6b35',
      contrastText: '#FFFFFF',
    },
    tertiary: {
      main: '#232946', // Used for CTA and buttons primarily
      contrastText: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
  },
});


const MuiThemeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    return <ThemeProvider theme={canyoningTheme}>{children}</ThemeProvider>
}

export default MuiThemeProvider;