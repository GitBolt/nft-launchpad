import * as nacl from 'tweetnacl';
import { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey } from '@solana/web3.js';
import { getMessageToSign } from '@/components/wallet';

export const verifyKeys = (
  req: NextApiRequest,
  res: NextApiResponse,
  requiredKeys: string[],
): boolean => {
  const data = JSON.parse(req.body);
  const missingKeys = requiredKeys.filter((key) => (
    !Object.prototype.hasOwnProperty.call(data, key)
  ));
  if (missingKeys.length > 0) {
    res.status(400).json({ detail: `Missing Parameters: ${missingKeys.join(', ')}` });
    return false;
  }
  return true;
};

export const verifyNewUser = (
  req: NextApiRequest,
  res: NextApiResponse,
): boolean => {
  try {
    const data = JSON.parse(req.body);
    const signature = new Uint8Array(data.signature.signature.data);
    const stringPublicKey = data.public_key;
    const public_key = new PublicKey(stringPublicKey).toBytes();
    const stringMessage = getMessageToSign(data.nonce);
    const message = new TextEncoder().encode(stringMessage);
    const verified = nacl.sign.detached.verify(message, signature, public_key);
    if (!verified) {
      res.status(401).json({ detail: 'Unauthenticated' });
      return false;
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const verifyMethod = (
  req: NextApiRequest,
  res: NextApiResponse,
  method: string,
): boolean => {
  if (req.method !== method) {
    res.setHeader('Allow', [method]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return false;
  }
  return true;
};

export const verifyExistingUser = (
  nonce: string,
  stringPublicKey: string,
  signature: any,
  res: NextApiResponse,
): boolean => {
  const stringMessage = getMessageToSign(nonce);
  const message = new TextEncoder().encode(stringMessage);
  const public_key = new PublicKey(stringPublicKey).toBytes();
  const parsedSignature = new Uint8Array(signature.signature.data);
  const verified = nacl.sign.detached.verify(message, parsedSignature, public_key);
  if (!verified) {
    res.status(401).json({ detail: 'Unauthenticated' });
    return false;
  }
  return true;
};
