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
  const [error, setError] = useState<string | null>(null);

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
            onChange={(e) => {
              if (Number.isNaN(Number(e.target.value)) || Number(e.target.value) === 0) {
                setError('Amount can only be numeric and greater than 0');
              } else {
                // @ts-ignore
                setDynamicMintConfig({ ...dynamicMintConfig, startPrice: Number(e.target.value) });
              }
            }}
            style={{
              width: '100%',
              marginTop: '2rem',
            }}
            error={!!error}
            helperText={error && error}
          />
        </div>
      </Item>
      <Item
        heading="Minimum price"
        subheading="The minimum possible price for this token, if nobody buys during the bootstrapping interval. The wider the range between starting price and minimum price, the more rapidly the price will fall. It is reccommended to keep these numbers within 5x of each other."
      >
        <div className="flex align-start items-center w-1/2 flex-col">
          <Text
            variant="outlined"
            fullWidth
            onChange={(e) => {
              if (Number.isNaN(Number(e.target.value)) || Number(e.target.value) === 0) {
                setError('Amount can only be numeric and greater than 0');
              } else {
                // @ts-ignore
                setDynamicMintConfig({ ...dynamicMintConfig, minPrice: Number(e.target.value) });
              }
            }}
            style={{
              width: '100%',
              marginTop: '2rem',
            }}
            error={!!error}
            helperText={error && error}
          />
        </div>
      </Item>
      <Item
        heading="Interval"
        subheading="How long should this LBC go on for? This period is the time during which the price will fall. We recommend you set this period long enough so that everyone gets a chance to participate."
      >
        <div className="flex align-start items-center w-1/2 flex-col">
          <Text
            variant="outlined"
            fullWidth
            onChange={(e) => {
              if (Number.isNaN(Number(e.target.value)) || Number(e.target.value) === 0) {
                setError('Amount can only be numeric and greater than 0');
              } else {
                // @ts-ignore
                setDynamicMintConfig({ ...dynamicMintConfig, interval: Number(e.target.value) });
              }
            }}
            style={{
              width: '100%',
              marginTop: '2rem',
            }}
            error={!!error}
            helperText={error && error}
          />
        </div>
      </Item>
      <Item
        heading="Number of tokens"
        subheading="The number of items that will be sold in the dynamic pricing mint. This should not exceed the number of items remaining in the candymachine at the time dynamic pricing begins. Note that, depending on the above parameters this may not mint out"
      >
        <div className="flex align-start items-center w-1/2 flex-col">
          <Text
            variant="outlined"
            fullWidth
            onChange={(e) => {
              if (Number.isNaN(Number(e.target.value)) || Number(e.target.value) === 0) {
                setError('Amount can only be numeric and greater than 0');
              } else {
                // @ts-ignore
                setDynamicMintConfig({ ...dynamicMintConfig, maxSupply: Number(e.target.value) });
              }
            }}
            style={{
              width: '100%',
              marginTop: '2rem',
            }}
            error={!!error}
            helperText={error && error}
          />
        </div>
      </Item>
    </>
  );
};
