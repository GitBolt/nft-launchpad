import '@/styles/globals.scss';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Wallet } from '@/layouts/Wallet';
import { StrataProviders } from '@strata-foundation/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { ChakraProvider } from '@chakra-ui/react';

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
    <ChakraProvider>
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
    </ChakraProvider>
  );
};

export default Launchpad;
