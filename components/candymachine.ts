import * as anchor from '@project-serum/anchor';
import {
  BN, Program,
} from '@project-serum/anchor';
import {
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getRPC, connectWallet, signNonce,
} from '@/components/wallet';
import getWallet from '@/components/whichWallet';
import { PromisePool } from '@supercharge/promise-pool';
import { sleep } from '@/lib/utils';
import { postNetworkRequest } from '@/util/functions';
import { CandyMachineData } from '@/types/candymachine';
import type { Configurations } from '@/types/configurations';
import {
  CONFIG_ARRAY_START_V2,
  CANDY_MACHINE_PROGRAM_V2_ID,
  CONFIG_LINE_SIZE_V2,
} from '@/components/constants';

export async function createCandyMachineV2Account(
  anchorProgram: any,
  candyData: CandyMachineData,
  payerWallet: any,
  candyAccount: any,
) {
  const size = CONFIG_ARRAY_START_V2
    + 4
    + candyData.itemsAvailable.toNumber() * CONFIG_LINE_SIZE_V2
    + 8
    + 2 * (Math.floor(candyData.itemsAvailable.toNumber() / 8) + 1);

  return anchor.web3.SystemProgram.createAccount({
    fromPubkey: payerWallet,
    newAccountPubkey: candyAccount,
    space: size,
    lamports:
      await anchorProgram.provider.connection.getMinimumBalanceForRentExemption(
        size,
      ),
    programId: CANDY_MACHINE_PROGRAM_V2_ID,
  });
}

export function uuidFromConfigPubkey(configAccount: PublicKey) {
  return configAccount.toBase58().slice(0, 6);
}

export const createCandyMachineV2 = async function createCandyMachineV2(
  anchorProgram: anchor.Program,
  payerWallet: PublicKey,
  treasuryWallet: PublicKey,
  splToken: PublicKey | null,
  candyData: CandyMachineData,
) {
  const candyAccount = Keypair.generate();
  // eslint-disable-next-line no-param-reassign
  candyData.uuid = uuidFromConfigPubkey(candyAccount.publicKey);

  if (!candyData.symbol) {
    throw new Error('Invalid config, there must be a symbol.');
  }

  if (!candyData.creators || candyData.creators.length === 0) {
    throw new Error('Invalid config, there must be at least one creator.');
  }

  const totalShare = (candyData.creators || []).reduce(
    (acc: any, curr: any) => acc + curr.share,
    0,
  );

  if (totalShare !== 100) {
    throw new Error('Invalid config, creators shares must add up to 100');
  }

  const remainingAccounts = [];
  if (splToken) {
    remainingAccounts.push({
      pubkey: splToken,
      isSigner: false,
      isWritable: false,
    });
  }
  return {
    userPublicKey: payerWallet,
    candyMachine: candyAccount.publicKey,
    uuid: candyData.uuid,
    txId: await anchorProgram.rpc.initializeCandyMachine(candyData, {
      accounts: {
        candyMachine: candyAccount.publicKey,
        wallet: treasuryWallet,
        authority: payerWallet,
        payer: payerWallet,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [candyAccount],
      remainingAccounts:
        remainingAccounts.length > 0 ? remainingAccounts : undefined,
      instructions: [
        await createCandyMachineV2Account(
          anchorProgram,
          candyData,
          payerWallet,
          candyAccount.publicKey,
        ),
      ],
    }),
  };
};

export function parseDate(date: string) {
  if (date === 'now') {
    return Date.now() / 1000;
  }
  return Date.parse(date) / 1000;
}
export async function loadCandyProgramV2(
  publicKey: PublicKey,
  customRpcUrl: string,
) {
  const solConnection = new anchor.web3.Connection(customRpcUrl);
  const wallet = getWallet();
  const walletWrapper: any = {
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
    publicKey: new PublicKey(publicKey.toBase58()),
  };
  const provider = new anchor.Provider(solConnection, walletWrapper, {
    preflightCommitment: 'recent',
  });
  const idl = await anchor.Program.fetchIdl(
    CANDY_MACHINE_PROGRAM_V2_ID,
    provider,
  );
  if (!idl) return;
  const program = new anchor.Program(
    idl,
    CANDY_MACHINE_PROGRAM_V2_ID,
    provider,
  );
  console.log('Program ID from Anchor: ', program.programId.toBase58());
  return program;
}

export const sendTxWithKeypair = async (
  tx: Transaction,
  connection: anchor.web3.Connection,
  from: Keypair[],
) => {
  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [...from],
  );
  return signature;
};

export async function loadCandyProgramV2Raw(
  walletKeyPair: Keypair,
  customRpcUrl: string,
) {
  if (customRpcUrl) console.log('USING CUSTOM URL', customRpcUrl);
  const solConnection = new anchor.web3.Connection(customRpcUrl);
  const walletWrapper: any = {
    signTransaction: (tx: Transaction) => tx.sign(walletKeyPair),
    signAllTransactions: (txs: Transaction[]) => txs.map((tx) => tx.sign(walletKeyPair)),
    publicKey: walletKeyPair.publicKey,
  };
  const provider = new anchor.Provider(solConnection, walletWrapper, {
    preflightCommitment: 'recent',
  });
  const idl = await anchor.Program.fetchIdl(
    CANDY_MACHINE_PROGRAM_V2_ID,
    provider,
  );
  if (!idl) return;
  const program = new anchor.Program(
    idl,
    CANDY_MACHINE_PROGRAM_V2_ID,
    provider,
  );
  return program;
}

export const initCandyMachine = async (
  filesAmount: number,
  solTreasuryWallet: PublicKey,
  goLiveDate: string,
  price: number,
  whitelistMintSettings: any,
  royalty: number,
  endSettings: any,
) => {
  console.log('Trying to initialize CandyMachine V2');
  const stringPublicKey = await connectWallet(true, true);
  if (!stringPublicKey) return;
  const userPublicKey = new PublicKey(stringPublicKey);
  const anchorProgram = await loadCandyProgramV2(
    userPublicKey,
    getRPC(),
  );
  if (!anchorProgram) return;
  try {
    const res = await createCandyMachineV2(
      anchorProgram,
      userPublicKey,
      solTreasuryWallet,
      null,
      {
        itemsAvailable: new BN(filesAmount),
        uuid: null,
        symbol: 'MINT',
        sellerFeeBasisPoints: royalty * 100,
        isMutable: true,
        maxSupply: new BN(filesAmount),
        retainAuthority: true,
        gatekeeper: null,
        goLiveDate: new BN(parseDate(goLiveDate)),
        price: new BN(price),
        endSettings,
        whitelistMintSettings,
        hiddenSettings: null,
        creators: [{
          address: userPublicKey,
          verified: true,
          share: 100,
        }],
      },
    );
    const resWithAnchor = { ...res, ...{ anchorProgram } };
    if (!res.candyMachine) return;
    return resWithAnchor;
  } catch (e: any) {
    if (e.message.includes('0x1')) {
      throw Error('Insufficient funds');
    }
    throw Error(e.message);
  }
};

export const writeIndices = async ({
  anchorProgram,
  candyMachine,
  walletKeyPair,
  rateLimit,
  project_id,
}: {
  anchorProgram: Program;
  candyMachine: any;
  walletKeyPair: Keypair;
  rateLimit: number;
  project_id: number;
}) => {
  const public_key = await connectWallet(true, true);
  if (!public_key) return;
  console.log('Trying to write indices...');
  const request = await fetch(`/api/cache/get/project_id/${project_id}`);

  const cacheContent = await request.json();
  let uploadSuccessful = true;
  const keys = Object.keys(cacheContent.items);
  const poolArray = [];
  let uploaded = 0;
  const allIndicesInSlice = Array.from(Array(keys.length).keys());
  let offset = 0;
  while (offset < allIndicesInSlice.length) {
    let length = 0;
    let lineSize = 0;
    let configLines = allIndicesInSlice.slice(offset, offset + 16);
    while (
      length < 850
      && lineSize < 16
      && configLines[lineSize] !== undefined
    ) {
      length
        += cacheContent.items[keys[configLines[lineSize]]].link.length
        + cacheContent.items[keys[configLines[lineSize]]].name.length;
      if (length < 850) lineSize += 1;
    }
    configLines = allIndicesInSlice.slice(offset, offset + lineSize);
    offset += lineSize;
    const onChain = configLines.filter(
      (i) => cacheContent.items[keys[i]]?.on_chain || false,
    );
    const index = keys[configLines[0]];
    if (onChain.length !== configLines.length) {
      poolArray.push({ index, configLines });
    } else {
      uploaded += 1;
    }
  }
  console.log(`Writing all indices in ${poolArray.length} transactions...`);
  console.log(`Already uploaded indices count: ${uploaded}`);
  const addConfigLines = async ({ index, configLines }: any) => {
    console.count('Indice Function');
    const response = await anchorProgram.rpc.addConfigLines(
      index,
      configLines.map((i: any) => ({
        uri: cacheContent.items[keys[i]].link,
        name: cacheContent.items[keys[i]].name,
      })),
      {
        accounts: {
          candyMachine,
          authority: walletKeyPair.publicKey,
        },
        signers: [walletKeyPair],
      },
    );
    console.log('Finished writing indices: ', response);
    console.log('Candy machine ID: ', cacheContent.candy_machine);

    const signature = await signNonce();
    if (!signature) return;
    const items = configLines.map((i: any) => cacheContent.items[keys[i]].id);
    console.log(items);
    const data = {
      items,
      signature,
      public_key,
    };
    await postNetworkRequest(
      data,
      '/api/cache/write',
      'Error writing cache',
    );
  };

  await PromisePool.withConcurrency(rateLimit || 5)
    .for(poolArray)
    .handleError(async (err, { index, configLines }) => {
      console.log(
        `\nFailed writing indices ${index}-${keys[configLines[configLines.length - 1]]
        }: ${err.message}`,
      );
      await sleep(5000);
      uploadSuccessful = false;
    })
    .process(async ({ index, configLines }) => {
      await addConfigLines({ index, configLines });
    });
  return uploadSuccessful;
};

export const updateCandyMachine = async (
  project_id: number,
  config: Configurations,
  walletAccount?: PublicKey | null,
  splToken?: PublicKey | null,
) => {
  const userPublicKey = await connectWallet(true, false);
  const anchorProgram = await loadCandyProgramV2(
    userPublicKey,
    getRPC(),
  );
  if (!anchorProgram) return;
  const request = await fetch(`/api/cache/get/project_id/${project_id}`);
  const cacheContent = await request.json();
  const candyMachine = new PublicKey(cacheContent.candy_machine);

  const candyMachineObj: any = await anchorProgram.account.candyMachine.fetch(
    candyMachine,
  );

  let { endSettings } = config;
  if (endSettings && endSettings.endSettingType.date) {
    // @ts-ignore (value will be date object cause of the if statement)
    const value = endSettings.number.toUTCString().split(', ')[1];
    endSettings = {
      endSettingType: { date: true },
      number: new BN(parseDate(value)),
    };
  }
  if (endSettings && endSettings.endSettingType.amount) {
    endSettings = {
      endSettingType: { amount: true },
      // @ts-ignore (value will be integer cause of the if statement)
      number: new BN(endSettings.number),
    };
  }

  let { whitelistMintSettings } = config;
  if (whitelistMintSettings) {
    whitelistMintSettings = {
      mode: config.whitelistMintSettings!.mode,
      presale: config.whitelistMintSettings!.presale,
      mint: config.whitelistMintSettings!.mint,
      discountPrice: new BN(Number(config.whitelistMintSettings?.discountPrice) * LAMPORTS_PER_SOL),
    };
  }
  console.log('Good so far', config);
  const newSettings = {
    splToken: new PublicKey(config.splToken as string),
    splTokenAccount: new PublicKey(config.splToken as string),
    itemsAvailable: candyMachineObj.data.itemsAvailable,
    uuid: candyMachineObj.data.uuid,
    symbol: candyMachineObj.data.symbol,
    sellerFeeBasisPoints: candyMachineObj.data.sellerFeeBasisPoints,
    isMutable: true,
    maxSupply: new anchor.BN(0),
    retainAuthority: true,
    gatekeeper: null,
    goLiveDate: new BN(parseDate(config.goLiveDate!.toUTCString().split(', ')[1])),
    endSettings,
    price: new BN(config.price! * LAMPORTS_PER_SOL),
    whitelistMintSettings,
    hiddenSettings: null,
    creators: candyMachineObj.data.creators.map((creator: any) => ({
      address: new PublicKey(creator.address),
      verified: true,
      share: creator.share,
    })),
  };
  console.log('Update configs: ', newSettings);

  await anchorProgram.rpc.updateCandyMachine(newSettings, {
    accounts: {
      candyMachine,
      authority: userPublicKey,
      wallet: walletAccount || userPublicKey,
    },
    remainingAccounts: splToken ? [{
      pubkey: new PublicKey(splToken),
      isSigner: false,
      isWritable: false,
    }] : undefined,
  });
};

export const updateAuthority = async (
  userPublicKey: PublicKey,
  newAuthority: PublicKey,
  project_id: Number,
) => {
  const request = await fetch(`/api/cache/get/project_id/${project_id}`);
  const cacheContent = await request.json();

  const candyMachine = new PublicKey(cacheContent.candy_machine);
  const newAuthorityKey = new PublicKey(newAuthority);

  const anchorProgram = await loadCandyProgramV2(
    userPublicKey,
    getRPC(),
  );
  if (!anchorProgram) return;
  const tx = await anchorProgram.rpc.updateAuthority(newAuthorityKey, {
    accounts: {
      candyMachine,
      authority: userPublicKey,
      wallet: userPublicKey,
    },
  });
  console.log(tx);
};

export const updateAuthorityRaw = async (
  userKeyPair: Keypair,
  newAuthority: PublicKey,
  project_id: Number,
) => {
  const request = await fetch(`/api/cache/get/project_id/${project_id}`);
  const cacheContent = await request.json();

  const candyMachine = new PublicKey(cacheContent.candy_machine);
  const newAuthorityKey = new PublicKey(newAuthority);

  const anchorProgram = await loadCandyProgramV2Raw(
    userKeyPair,
    getRPC(),
  );
  if (!anchorProgram) return;
  const tx = anchorProgram.rpc.updateAuthority(newAuthorityKey, {
    accounts: {
      candyMachine,
      authority: userKeyPair.publicKey,
      wallet: userKeyPair.publicKey,
    },
  });
  console.log('Update authority tx: ', tx);
};
