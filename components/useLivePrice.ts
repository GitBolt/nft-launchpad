import { SplTokenBonding } from '@strata-foundation/spl-token-bonding';
import { getRPC } from '@/components/wallet';
import * as anchor from '@project-serum/anchor';
import { useSolanaUnixTime } from '@strata-foundation/react';
import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';


export function useLivePrice(tokenBondingString: string) {
  const { publicKey, signAllTransactions, signTransaction } = useWallet();
  const unixTime = useSolanaUnixTime();
  const [currentPrice, setCurrentPrice] = useState<number | undefined>();
  const fetch = useCallback(async () => {
    const tokenBonding = new anchor.web3.PublicKey(tokenBondingString);
    const connection = new anchor.web3.Connection(getRPC());
    const provider: any = new anchor.Provider(connection,
      {
        publicKey: publicKey,
        signAllTransactions: signAllTransactions,
        signTransaction: signTransaction,
      } as anchor.Wallet, {});
    const tokenBondingSdk = await SplTokenBonding.init(provider);
    const data = await tokenBondingSdk.getPricing(tokenBonding);
    return data;
  }, [publicKey, signAllTransactions, signTransaction, tokenBondingString]);
    
  useEffect(() => {
    const interval = setInterval(() => {
      fetch().then((res) => {
        if (!res) return;
        setCurrentPrice(
          res.current(res.hierarchy.tokenBonding.baseMint, unixTime),
        );
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [fetch, unixTime]);
  
  return currentPrice;
}