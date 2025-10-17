import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";

const canyoningTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#232946', 
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#eebbc3',
      contrastText: '#FFFFFF',
    },
    // background: {
    //   default: '#E5EBE9', // Mist Grey
    //   paper: '#FFFFFF',
    // },
    // text: {
    //   primary: '#1B1D1B', // Deep Forest Black
    //   secondary: '#6E7B75', // Pebble Grey
    // },
    // success: {
    //   main: '#A4C686', // Alpine Lime
    //   contrastText: '#1B1D1B',
    // },
    // warning: {
    //   main: '#FFC107', // Optional: standard amber for visibility
    //   contrastText: '#1B1D1B',
    // },
    // error: {
    //   main: '#B85C5C', // Canyon Red
    //   contrastText: '#FFFFFF',
    // },
    // info: {
    //   main: '#6C9A8B', // Fern Green — used for neutral highlights or info
    //   contrastText: '#FFFFFF',
    // },
    // grey: {
    //   100: '#F2F4F3',
    //   200: '#E0E4E2',
    //   300: '#C5CBC8',
    //   500: '#6E7B75',  // reused Pebble Grey
    //   800: '#2F3E46',  // Wet Slate
    // },
  },
  typography: {
    fontFamily: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
  },
});


const MuiThemeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    return <ThemeProvider theme={canyoningTheme}>{children}</ThemeProvider>
}

export default MuiThemeProvider;