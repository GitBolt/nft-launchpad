import { Switch, Box, Button } from '@mui/material';
import React, { useState } from 'react';
import { handleCSV } from '@/util/handleCSV';
import type { Configurations } from '@/types/configurations';
import Add from '@material-ui/icons/Add';

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
};
export const WhitelistSection = function WhitelistSection({ setConfig }: whitelistProps) {
  const [burn, setBurn] = useState<boolean>(false);
  const [whitelists, setWhitelists] = useState<string[] | null>(null);

  return (
    <>
      <WhitelistItem
        heading="Setup Whitelist"
        subheading="Import all the whitelist members from CSV file."
      >
        <div className="flex align-start items-center w-full flex-col">
          <div className="text-gray-400 text-sm mt-1 w-full text-left">
            <p>The file shall have 2 columns:</p>
            <br />
            <p>1. The First Column shall mention all the wallet addresses approved for presale.</p>
            <p>
              2. The Second Column shall mention the maximum number of mints
              that the corresponding wallet address could do.
            </p>
          </div>
          <input
            id="fileInput"
            multiple
            type="file"
            style={{ display: 'none' }}
            accept=".csv"
            onChange={async (e) => {
              const { files } = e.target;
              if (!files) return;
              const whitelistAddresses = await handleCSV(files[0]);
              if (!whitelistAddresses) return;
              setWhitelists(whitelistAddresses);
              localStorage.setItem('whitelists', JSON.stringify(whitelistAddresses));
            }}
          />
          <label htmlFor="fileInput" className="w-full">
            <Button
              fullWidth
              variant="outlined"
              size="medium"
              component="span"
              sx={{
                marginTop: '1rem',
                borderRadius: '3rem',
                height: '3rem',
                display: 'flex',
                gap: '.75rem',
              }}
            >
              <Add />
              <p className="mt-1">Add CSV File</p>
            </Button>
            <p className="mt-2">
              {whitelists?.length || 0}
              {' '}
              Addresses whitelisted
            </p>
          </label>
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
