import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

type whiteListMintSettings = {
  mode: { 'burnEveryTime': boolean },
  mint: PublicKey | null,
  presale: boolean,
  discountPrice: null | number | BN
};

type endSettings = {
  endSettingType: any,
  number: BN | number | Date | null // BN for candy machine, Date for UI
};

export interface Configurations {
  itemsAvailable: number;
  price: number;
  royalty: number;
  solTreasuryAccount: PublicKey | string;
  splTreasuryAccount: PublicKey | string;
  splToken: PublicKey | string | null;
  splTokenAccount: PublicKey | string | null;
  goLiveDate: Date | null;
  whitelistMintSettings: whiteListMintSettings | null,
  endSettings: endSettings | null
}

export interface DynamicMintConfig {
  startPrice: number,
  minPrice: number, 
  interval: number,
  maxSupply: number,
  targetMint: string,
  tokenBonding: string,
  graveyardAta: string
}