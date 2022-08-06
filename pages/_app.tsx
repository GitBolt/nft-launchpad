import '../styles/globals.scss';
import type { AppProps } from 'next/app';

const Launchpad = function ({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
};

export default Launchpad;
