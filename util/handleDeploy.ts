import {
  writeIndices,
  updateAuthority,
  updateAuthorityRaw,
  loadCandyProgramV2Raw,
  initCandyMachine,
  parseDate,
} from '@/components/candymachine';
import type { Configurations } from '@/types/configurations';
import {
  PublicKey, Keypair, LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { postNetworkRequest } from '@/util/functions';
import { signNonce, connectWallet, getRPC } from '@/components/wallet';
import { BN } from '@project-serum/anchor';

export const deployCandyMachine = async (
  config: Configurations,
) => {
  let { endSettings } = config;
  // @ts-ignore
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
  if (whitelistMintSettings && whitelistMintSettings.discountPrice) {
    whitelistMintSettings = {
      ...whitelistMintSettings,
      discountPrice: new BN(
        whitelistMintSettings.discountPrice as number * LAMPORTS_PER_SOL,
      ),
    };
  }
  const cmRes = await initCandyMachine(
    config.itemsAvailable,
    new PublicKey(config.solTreasuryAccount),
    config.goLiveDate!.toUTCString().split(', ')[1],
    config.price ? config.price * LAMPORTS_PER_SOL : 0,
    whitelistMintSettings,
    endSettings,
  );
  const candyMachine = cmRes?.candyMachine;
  const uuid = cmRes?.uuid;
  const public_key = await connectWallet(true, true);
  if (!public_key) return;
  const signature = await signNonce();
  if (!signature) return;
  const data = {
    candy_machine: candyMachine,
    uuid,
    signature,
    public_key,
    network: getRPC() === 'https://api.mainnet-beta.solana.com' ? 'mainnet' : 'devnet',
  };
  await postNetworkRequest(
    data,
    '/api/cache/update',
    'Error updating cache',
  );
  return { candyMachine, uuid };
};

export const createTempWallet = async () => {
  let localKeyPair = localStorage.getItem('tempKeyPair');
  if (!localKeyPair) {
    const walletKeyPair = Keypair.generate();
    const stringKeyPair = JSON.stringify(Array.from(walletKeyPair.secretKey));
    localStorage.setItem('tempKeyPair', stringKeyPair);
    localKeyPair = stringKeyPair;
  }
  const tempKeyPair = JSON.parse(localKeyPair);
  const walletKeyPair = Keypair.fromSecretKey(Uint8Array.from(tempKeyPair));
  return walletKeyPair;
};

export const transferAuthority = async (
  userPublicKey: PublicKey,
) => {
  let localKeyPair = localStorage.getItem('tempKeyPair');
  if (!localKeyPair) {
    const walletKeyPair = Keypair.generate();
    const stringKeyPair = JSON.stringify(Array.from(walletKeyPair.secretKey));
    localStorage.setItem('tempKeyPair', stringKeyPair);
    localKeyPair = stringKeyPair;
  }
  const tempKeyPair = JSON.parse(localKeyPair);
  const walletKeyPair = Keypair.fromSecretKey(Uint8Array.from(tempKeyPair));
  console.log('Transferring authority...');
  console.log('New wallet pub key: ', walletKeyPair.publicKey.toBase58());
  await updateAuthority(
    new PublicKey(userPublicKey),
    walletKeyPair.publicKey,
    userPublicKey,
  );
  console.log('Authority transferred successfully');

  return walletKeyPair;
};

export const dataFromKp = (kp: string) => {
  const tempKeyPair = JSON.parse(kp);
  const walletKeyPair = Keypair.fromSecretKey(Uint8Array.from(tempKeyPair));
  return {
    pubKey: walletKeyPair.publicKey.toBase58(),
    privKey: Buffer.from(walletKeyPair.secretKey).toString('base64'),
  };
};

export const updateIndices = async (
  userPublicKey: PublicKey,
  walletKeyPair: Keypair,
  candyMachine: PublicKey,
) => {
  const rateLimit = 1;
  const anchorProgram = await loadCandyProgramV2Raw(
    walletKeyPair,
    getRPC(),
  );
  if (!anchorProgram) return;
  const res = await writeIndices({
    anchorProgram,
    candyMachine,
    walletKeyPair,
    rateLimit,
  });
  if (!res) throw new Error('Error writing indices');
  console.log('Updating authority back to original wallet...');
  await updateAuthorityRaw(
    walletKeyPair,
    new PublicKey(userPublicKey),
    userPublicKey,
  );
  console.log('Successfully updated authority.');
};
