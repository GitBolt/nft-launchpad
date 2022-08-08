import * as web3 from '@solana/web3.js';
import getWallet from '@/components/whichWallet';
// eslint-disable-next-line import/no-cycle
import { connectWallet, getRPC } from '@/components/wallet';
import { sleep } from '@/lib/utils';
import { Keypair, sendAndConfirmTransaction } from '@solana/web3.js';

export const depositSOL = async (
  to: web3.PublicKey,
  amount: number,
  delay?: boolean,
  fromTempKp?: boolean,
) => {
  let walletKp;
  if (fromTempKp) {
    const localKeyPair = localStorage.getItem('tempKeyPair');
    if (localKeyPair) {
      const tempKeyPair = JSON.parse(localKeyPair);
      walletKp = Keypair.fromSecretKey(Uint8Array.from(tempKeyPair));
    } else {
      throw Error('Temporary keypair not found');
    }
  }
  const connection = new web3.Connection(getRPC());
  const publicKey = fromTempKp ? walletKp?.publicKey : await connectWallet(true, false);
  const blockhash = await connection.getLatestBlockhash('finalized');
  const transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: to,
      lamports: amount * web3.LAMPORTS_PER_SOL,
    }),
  );
  transaction.recentBlockhash = blockhash.blockhash;
  transaction.feePayer = publicKey;
  console.log('Sending to: ', to.toString(), ' | ', await connection.getBalance(new web3.PublicKey(to)));
  console.log('Transfer amount: ', amount * web3.LAMPORTS_PER_SOL);
  try {
    if (!walletKp) {
      const wallet = getWallet();
      const signedTransaction = await wallet.signTransaction(transaction);
      const res = await connection.sendRawTransaction(signedTransaction.serialize());
      if (delay) {
        await sleep(10000);
      }
      console.log('Transfer successful');
      return res;
    }
    const res = await sendAndConfirmTransaction(
      connection,
      transaction,
      [walletKp],
      { commitment: 'finalized' },
    );
    if (delay) {
      await sleep(10000);
    }
    console.log('Transfer successful');
    return res;
  } catch (e: any) {
    console.log(e);
    if (e.toString().includes('0x1')) {
      throw new Error('Insufficient balance');
    }
    throw new Error(e.toString());
  }
};
  