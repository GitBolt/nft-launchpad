import '@/styles/globals.scss';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Wallet } from '@/layouts/Wallet';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

const theme = {
  palette: {
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
};

const darkModeTheme = createTheme(theme);

const Launchpad = function Launchpad({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Wallet>
        <Toaster />
        <ThemeProvider theme={darkModeTheme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </Wallet>
    </SessionProvider>
  );
};

export default Launchpad;
