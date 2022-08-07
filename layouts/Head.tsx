import Head from 'next/head';

interface SEO {
  title?: string;
  description?: string;
  image?: string;
}

export const DefaultHead = function (config: SEO) {
  return (
    <Head>
      <title>{config.title || 'Launchpad'}</title>
      <meta name='description' content={config.description || 'Launch NFTs seamlessly with dynamic mint pricing'} />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <meta name="theme-color" content="white" />
      <link rel='icon' href='/favicon.png' />
      <meta property='og:type' content={'website'} />
      <meta property='og:url' content={'https://dummy.app'} />
      <meta property='og:title' content={config.title || 'Launchpad'} />
      <meta property='og:description' content={config.description || 'Launch NFTs seamlessly with dynamic mint pricing'} />
      <meta property='og:image' content={config.image} />

      <meta property='twitter:card' content='summary_large_image' />
      <meta property='og:url' content={'https://dummy.app'} />
      <meta property='twitter:title' content={config.title || 'Launchpad'} />
      <meta property='twitter:description' content={config.description || 'Launch NFTs seamlessly with dynamic mint pricing'} />
      <meta property='twitter:image' content={config.image} />
    </Head>
  );
};