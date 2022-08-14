import { Switch, Box } from '@mui/material';
import React, { useState } from 'react';
import type { Configurations } from '@/types/configurations';
import { Text } from '@/layouts/StyledComponents';

interface Props {
  heading: string,
  subheading?: string,
  children: React.ReactNode,
}

const WhitelistItem = function WhitelistItem(props: Props) {
  return (
    <Box
      sx={{
        alignItems: 'flex-start',
        display: 'flex',
        flexFlow: 'column',
        color: 'black',
        textAlign: 'left',
      }}
    >
      <h1 className="text-2xl font-bold mt-6">{props.heading}</h1>
      <h3 className="text-lg mt-4 font-semibold">{props.subheading}</h3>
      {props.children}
    </Box>
  );
};

type whitelistProps = {
  setConfig: React.Dispatch<React.SetStateAction<Configurations>>
  setMintAmount: React.Dispatch<React.SetStateAction<number | null>>
};
export const WhitelistSectionBasic = function WhitelistSectionBasic({
  setConfig,
  setMintAmount,
}: whitelistProps) {
  const [burn, setBurn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <WhitelistItem
        heading="Setup Whitelist"
        subheading="Enter the amount of mints for the whitelist token"
      >
        <div className="flex align-start items-center w-full flex-col">
          <Text
            variant="outlined"
            fullWidth
            onChange={(e) => {
              if (Number.isNaN(Number(e.target.value)) || Number(e.target.value) === 0) {
                setError('Amount can only be numeric and greater than 0');
                localStorage.removeItem('whitelistLen');
              } else {
                setError(null);
                setMintAmount(Number(e.target.value));
                localStorage.setItem('whitelistLen', JSON.stringify(Number(e.target.value)));
              }
            }}
            label="Set number of mints"
            style={{
              width: '100%',
              marginTop: '2rem',
            }}
            error={!!error}
            helperText={error && error}
          />
        </div>
      </WhitelistItem>

      <WhitelistItem
        heading="Whitelist Settings"
        subheading="Burn mode"
      >
        <div className="flex align-start items-center w-full">
          <div className="mt-2">
            <p>Burn every time</p>
            <p className="text-gray-500 text-sm">Whitelist token is burned after the mint</p>
          </div>
          <Switch
            color="primary"
            sx={{ marginLeft: 'auto' }}
            onChange={() => {
              // @ts-ignore (whitelistMintSettings will always have default on this render)
              setConfig((prevState) => ({
                ...prevState,
                whitelistMintSettings: {
                  ...prevState.whitelistMintSettings,
                  mode: { burnEveryTime: !burn },
                },
              }));
              setBurn(!burn);
            }}
            checked={burn}
          />
        </div>
      </WhitelistItem>
    </>
  );
};
