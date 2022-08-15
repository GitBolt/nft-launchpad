import * as anchor from '@project-serum/anchor';
import { MarketplaceSdk } from '@strata-foundation/marketplace-sdk';
import * as web3 from '@solana/web3.js';
import { Token, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { sendMultipleInstructions } from '@strata-foundation/spl-utils';
import { DynamicMintConfig } from '@/types/configurations';
import { getRPC } from './wallet';

export const createLiquidityBootstrapper = async (
  wallet: anchor.Wallet | null, 
  publicKey: web3.PublicKey,
  dynamicMintConfig: DynamicMintConfig,
) => {

  const targetMintKeypair = web3.Keypair.generate();
  const connection = new web3.Connection(getRPC());
  const provider: any = new anchor.Provider(connection, wallet!, {});

  const marketplace = await MarketplaceSdk.init(provider);
  const {
    output: { targetMint, tokenBonding },
    instructions,
    signers,
  } = 
  await marketplace.createLiquidityBootstrapperInstructions({
    targetMintKeypair,
    authority: publicKey,
    metadata: {
      // Max name len 32
      name: 'Candymachine Mint Token',
      symbol: 'MINT',
      uri: '',
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    },
    baseMint: new web3.PublicKey('So11111111111111111111111111111111111111112'),
    startPrice: dynamicMintConfig.startPrice,
    minPrice: dynamicMintConfig.minPrice, 
    interval: dynamicMintConfig.interval,
    maxSupply: dynamicMintConfig.maxSupply, // How many tokens will be sold using the LBC
    bondingArgs: {
      targetMintDecimals: 0,
      goLiveDate: new Date(),
      sellFrozen: true,
    },
  });
  console.log('Target mint: ', targetMint.toBase58());
  console.log('Token bonding: ', tokenBonding.toBase58());
  const graveyard = new web3.PublicKey(
    'gravk12G8FF5eaXaXSe4VEC8BhkxQ7ig5AHdeVdPmDF',
  );
  const graveyardAta = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    targetMint,
    graveyard,
    true,
  );
  const lastInstrs = instructions[instructions.length - 1];
  lastInstrs.push(
    Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      targetMint,
      graveyardAta,
      graveyard,
      publicKey,
    ),
  );

  console.log('Graveyard ATA: ', graveyardAta.toBase58());
  await sendMultipleInstructions(
    new Map(),
    provider,
    instructions,
    signers,
  );
  return {
    targetMint,
    tokenBonding,
    graveyardAta,
  };
};