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
import { useWallet } from '@solana/wallet-adapter-react';

import React from 'react';
import { BondingPlot } from '@strata-foundation/marketplace-ui';
import { LbcInfo } from '@strata-foundation/marketplace-ui';
import { LbcStatus } from '@strata-foundation/marketplace-ui';
import { TransactionHistory } from '@strata-foundation/marketplace-ui';
import { web3 } from '@project-serum/anchor';
import { SplTokenBonding } from '@strata-foundation/spl-token-bonding';
import { getRPC } from '@/components/wallet';
import * as anchor from '@project-serum/anchor';
import { useSolanaUnixTime } from '@strata-foundation/react';
interface Props {
  candyMachine: any;
}

export const DynamicPricingCM = function ({ candyMachine }: Props) {
  const { connected, publicKey, signAllTransactions, signTransaction } = useWallet();

  const cmState = candyMachine.state;
  const mintKey = cmState?.tokenMint;
  const tokenBonding = new web3.PublicKey('5HCs7cPMKc3tfCupp9PoaCsTawqDr7GWtgzhxuFeHgUT');
  const unixTime = useSolanaUnixTime();

  const fetch = async () => {
    const connection = new web3.Connection(getRPC());
    const provider: any = new anchor.Provider(connection,
      {
        publicKey: publicKey,
        signAllTransactions: signAllTransactions,
        signTransaction: signTransaction,
      } as anchor.Wallet, {});
    const tokenBondingSdk = await SplTokenBonding.init(provider);
    const data = await tokenBondingSdk.getPricing(tokenBonding);
    console.log(data?.current(data.hierarchy.tokenBonding.baseMint, unixTime));
  };

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
                <button onClick={() => fetch()}>click</button>
            </TabList>
            <TabPanels>
                <TabPanel p={0} pt={4}>
                    {typeof window !== 'undefined' && <LbcStatus tokenBondingKey={new web3.PublicKey('5HCs7cPMKc3tfCupp9PoaCsTawqDr7GWtgzhxuFeHgUT')} />}
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
