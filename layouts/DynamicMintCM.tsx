import {
  Box,
  Button,
  Center,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from '@chakra-ui/react';

import React from 'react';
import { BondingPlot } from '@strata-foundation/marketplace-ui';
import { LbcInfo } from '@strata-foundation/marketplace-ui';
import { LbcStatus } from '@strata-foundation/marketplace-ui';
import { TransactionHistory } from '@strata-foundation/marketplace-ui';
import { web3 } from '@project-serum/anchor';
import { useLivePrice } from '@/components/useLivePrice';
import { useWallet } from '@solana/wallet-adapter-react';


interface Props {
  candyMachine: any;
  tokenBonding: web3.PublicKey
}

export const DynamicPricingCM = function ({ candyMachine, tokenBonding }: Props) {

  const price = useLivePrice(tokenBonding.toBase58());
  const cmState = candyMachine.state;
  console.log(cmState);
  const mintKey = cmState?.tokenMint;
  const { connected } = useWallet();


  return (
      <Tabs variant="unstyled" isLazy>
        <TabList borderBottom="none">
          <Tab fontWeight={600}>
            Mint
          </Tab>
          {true && (
            <Tab fontWeight={600}>
              Transactions
            </Tab>
          )}
          <button>{price}</button>
        </TabList>
        <TabPanels>
          <TabPanel p={0} pt={4}>
            {typeof window !== 'undefined' && <LbcStatus tokenBondingKey={new web3.PublicKey(tokenBonding)} />}
            <Box
              zIndex={1}
              shadow="xl"
              rounded="lg"
              p="16px"
              pb="29px"
              minH="300px"
            >
              {connected && (
                <>
                  {!cmState && (
                    <Center>
                      <Spinner />
                    </Center>
                  )}
                  {cmState && (
                    <VStack align="stretch" spacing={8}>
                      {true && (
                        <LbcInfo price={2} id={new web3.PublicKey(mintKey)} />
                      )}
                    </VStack>
                  )}
                </>
              )}
              {!connected && (
                <Center>
                  <Button
                    variant="outline"
                    colorScheme="primary"
                  >
                    Connect Wallet
                  </Button>
                </Center>
              )}
            </Box>
          </TabPanel>
          <TabPanel p={0} pt={4}>
            <Box
              zIndex={1}
              shadow="xl"
              rounded="lg"
              p="16px"
              pb="29px"
              minH="300px"
            >
              <VStack align="stretch" spacing={8}>
                <BondingPlot tokenBondingKey={tokenBonding} />
                <TransactionHistory tokenBondingKey={tokenBonding} />
              </VStack>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
  );
};
