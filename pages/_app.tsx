import '@/styles/globals.scss';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Wallet } from '@/layouts/Wallet';
import { StrataProviders } from '@strata-foundation/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

const theme = {

  palette: {
    background: {
      default: '#0B1F3D',
    },
    mode: 'dark' as PaletteMode,
    primary: {
      main: '#0E2C97',
    },
    secondary: {
      main: '#0E2C97',
    },
    error: {
      main: '#FF6262',
    },
  },
  overrides: {
    MuiPickersBasePicker:{
      pickerView:{
        backgroundColor:'black',
      },
    },
  },
  root: {
    '& .MuiInputBase-root': {
      border: '1px solid red',
    },
  },
};

const darkModeTheme = createTheme(theme);



const Launchpad = function Launchpad({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <Wallet>
      <SessionProvider session={pageProps.session}>
        <StrataProviders>
          <Toaster />
          <ThemeProvider theme={darkModeTheme}>
            <Component {...pageProps} />
          </ThemeProvider>
        </StrataProviders>
      </SessionProvider>
    </Wallet>
  );
};

export default Launchpad;
