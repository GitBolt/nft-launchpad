import { Box } from '@mui/material';
import React, { useState } from 'react';
import type { DynamicMintConfig } from '@/types/configurations';
import { Text } from '@/layouts/StyledComponents';

interface Props {
  heading: string,
  subheading?: string,
  children: React.ReactNode,
}

const Item = function Item(props: Props) {
  return (
    <Box
      sx={{
        alignItems: 'flex-start',
        display: 'flex',
        flexFlow: 'column',
        color: '#929292',
        textAlign: 'left',
      }}
    >
      <h1 className="text-2xl font-bold mt-6">{props.heading}</h1>
      <h3 className="text-lg mt-4 font-semibold w-[60%]">{props.subheading}</h3>
      {props.children}
    </Box>
  );
};

type whitelistProps = {
  setDynamicMintConfig: React.Dispatch<React.SetStateAction<DynamicMintConfig | null>>,
  dynamicMintConfig: DynamicMintConfig | null
};
export const DynamicMint = function DynamicMint({
  setDynamicMintConfig,
  dynamicMintConfig,
}: whitelistProps) {
  const [startingPriceError, setStartingPriceError] = useState<string | null>(null);
  const [minPriceError, setMinPriceError] = useState<string | null>(null);
  const [intervalError, setIntervalError] = useState<string | null>(null);
  const [tokensError, setTokensError] = useState<string | null>(null);

  return (
    <>
      <Item
        heading="Starting price"
        subheading="The starting price for this token. You should set this a little above the expected price of the token. Prices will fall to the fair price. Note that if there's enough demand, they can also increase from this price."
      >
        <div className="flex align-start items-center w-1/2 flex-col">
          <Text
            variant="outlined"
            fullWidth
            value={dynamicMintConfig?.startPrice || ''}
            onChange={(e) => {
              if (Number.isNaN(Number(e.target.value))) {
                setStartingPriceError('Amount can only be numeric and greater than 0');
              } else {
                setStartingPriceError(null);
                // @ts-ignore
                setDynamicMintConfig({ ...dynamicMintConfig, startPrice: Number(e.target.value) });
              }
            }}
            style={{
              width: '100%',
              marginTop: '2rem',
            }}
            error={!!startingPriceError}
            helperText={startingPriceError && startingPriceError}
          />
        </div>
      </Item>
      <Item
        heading="Minimum price"
        subheading="The minimum possible price for this token, if nobody buys during the bootstrapping interval. The wider the range between starting price and minimum price, the more rapidly the price will fall. It is reccommended to keep these numbers within 5x of each other."
      >
        <div className="flex align-start items-center w-1/2 flex-col">
          <Text
            value={dynamicMintConfig?.minPrice || ''}
            variant="outlined"
            fullWidth
            onChange={(e) => {
              if (Number.isNaN(Number(e.target.value))) {
                setMinPriceError('Amount can only be numeric and greater than 0');
              } else {
                setMinPriceError(null);
                // @ts-ignore
                setDynamicMintConfig({ ...dynamicMintConfig, minPrice: Number(e.target.value) });
              }
            }}
            style={{
              width: '100%',
              marginTop: '2rem',
            }}
            error={!!minPriceError}
            helperText={minPriceError && minPriceError}
          />
        </div>
      </Item>
      <Item
        heading="Interval"
        subheading="How long should this LBC go on for? This period is the time during which the price will fall. We recommend you set this period long enough so that everyone gets a chance to participate."
      >
        <div className="flex align-start items-center w-1/2 flex-col">
          <Text
            value={dynamicMintConfig?.interval || ''}
            variant="outlined"
            fullWidth
            placeholder='Enter seconds'
            onChange={(e) => {
              if (Number.isNaN(Number(e.target.value))) {
                setIntervalError('Amount can only be numeric and greater than 0');
              } else {
                setIntervalError(null);
                // @ts-ignore
                setDynamicMintConfig({ ...dynamicMintConfig, interval: Number(e.target.value) });
              }
            }}
            style={{
              width: '100%',
              marginTop: '2rem',
            }}
            error={!!intervalError}
            helperText={intervalError && intervalError}
          />
        </div>
      </Item>
      <Item
        heading="Number of tokens"
        subheading="The number of items that will be sold in the dynamic pricing mint. This should not exceed the number of items remaining in the candymachine at the time dynamic pricing begins. Note that, depending on the above parameters this may not mint out"
      >
        <div className="flex align-start items-center w-1/2 flex-col">
          <Text
            value={dynamicMintConfig?.maxSupply || ''}
            variant="outlined"
            fullWidth
            onChange={(e) => {
              if (Number.isNaN(Number(e.target.value))) {
                setTokensError('Token count can only be numeric and greater than 0');
              } else {
                setTokensError(null);
                // @ts-ignore
                setDynamicMintConfig({ ...dynamicMintConfig, maxSupply: Number(e.target.value) });
              }
            }}
            style={{
              width: '100%',
              marginTop: '2rem',
            }}
            error={!!tokensError}
            helperText={tokensError && tokensError}
          />
        </div>
      </Item>
    </>
  );
};
