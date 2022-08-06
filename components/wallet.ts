import toast from 'react-hot-toast';
import {
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
// eslint-disable-next-line import/no-cycle
import { depositSOL } from '@/components/functions';
import { sleep } from '@/lib/utils';
import getWallet from './whichWallet';

export const getTokens = async (account: string) => {
  try {
    const request = await fetch(`https://public-api.solscan.io/account/tokens?account=${account}`);
    const data = await request.json();
    return data;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getRPC = () => {
  const localStorageCluster = localStorage.getItem('cluster');
  const RPC_URL = localStorageCluster || 'https://api.devnet.solana.com';
  return RPC_URL;
};

export const connectWallet = async (
  dontMessage ? : boolean,
  string ? : boolean,
  delay?: boolean,
) => {
  if (delay) {
    await sleep(1000);
  }
  const wallet = getWallet();
  if (wallet) {
    const response = await wallet.connect();
    if (!response || !response.publicKey) {
      toast.error('Failed to connect to wallet');
      return undefined;
    }
    if (!dontMessage) {
      toast.success('Connected to wallet');
    }
    return string ? wallet.publicKey.toString() : wallet.publicKey;
  }
  toast.error('No Solana wallets found');
  window.open('https://phantom.app/', '_blank');
  return undefined;
};

export const disconnectWallet = async () => {
  const wallet = getWallet();
  if (wallet) {
    await wallet.disconnect();
    toast.success('Disconnected from wallet');
  }
};

export const getMessageToSign = (nonce: string) => (
  `Please sign this message so that we can verify you: ${nonce}`
);

export const signMessage = async (message: string) => {
  const wallet = getWallet();
  const encodedMessage = new TextEncoder().encode(message);
  const signedMessage = await wallet.signMessage(encodedMessage, 'utf8');
  return signedMessage;
};

export const walletIsConnected = () => {
  const wallet = getWallet();
  return wallet.isConnected;
};

export const getNonce = async (): Promise < string | undefined > => {
  const public_key = await connectWallet(true, true);
  if (!public_key) return undefined;
  const request = await fetch(`/api/nonce/get/${public_key}`);
  const {
    nonce,
  } = await request.json();
  return nonce;
};

export const signNonce = async () => {
  if (typeof localStorage === 'undefined') return undefined;
  const signatureExists = localStorage.getItem('signature');
  if (signatureExists) return JSON.parse(signatureExists);
  const nonce = await getNonce();
  if (!nonce) return undefined;
  const signature = await signMessage(getMessageToSign(nonce));
  localStorage.setItem('signature', JSON.stringify(signature));
  return signature;
};

export const sendTxUsingExternalSignature = async (
  instructions: TransactionInstruction[],
  connection: Connection,
  feePayer: Keypair | null,
  signersExceptWallet: Keypair[],
  wallet: any,
) => {
  const tx = new Transaction().add(...instructions);
  tx.setSigners(
    ...(feePayer
      ? [(feePayer as Keypair).publicKey, wallet.publicKey]
      : [wallet.publicKey]),
    ...signersExceptWallet.map((s) => s.publicKey),
  );
  tx.recentBlockhash = (await connection.getRecentBlockhash('max')).blockhash;
  signersExceptWallet.forEach((acc) => {
    tx.partialSign(acc);
  });
  const signed = await wallet.signTransaction(tx);
  const txid = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });
  return connection.confirmTransaction(txid, 'confirmed');
};

export const createNewToken = async (mintAccount: Keypair, addressesLen: number, toastId?: any) => {
  const connection = new Connection(getRPC());
  const user = await connectWallet(true, false);
  if (!user) return;
  await depositSOL(mintAccount.publicKey, 0.01, false, true);
  const mint = await Token.createMint(
    connection,
    mintAccount,
    mintAccount.publicKey,
    null,
    6,
    TOKEN_PROGRAM_ID,
  );
  console.log('Mint created');
  toast.loading('Minting tokens', {
    id: toastId,
  });
  const fromTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    mintAccount.publicKey,
  );
  const toTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    user,
  );
  await mint.mintTo(
    fromTokenAccount.address,
    mintAccount.publicKey,
    [],
    1000000 * addressesLen,
  );
  console.log('Minted to address');
  console.log('Mint public key ', mint.publicKey.toBase58());
  const transaction = new Transaction().add(
    Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      fromTokenAccount.address,
      toTokenAccount.address,
      mintAccount.publicKey,
      [],
      1000000 * addressesLen,
    ),
  );
  console.log('Created transfer instruction');
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [mintAccount],
    { commitment: 'confirmed' },
  );
  console.log('Mint transfer signature: ', signature);
  toast.success('Transferred tokens to your wallet', {
    id: toastId,
  });
  return mint.publicKey.toBase58();
};
