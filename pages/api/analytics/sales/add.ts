import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import {
  verifyMethod,
  verifyKeys,
} from '@/lib/server';
import {
  awaitTransactionSignatureConfirmation,
} from '@/components/mintCandymachine';
import * as anchor from '@project-serum/anchor';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const allowed = verifyMethod(req, res, 'POST');
  if (!allowed) return;
  const requiredKeys = ['mint_signature', 'price', 'presale', 'project_id'];
  const allKeysPresent = verifyKeys(req, res, requiredKeys);
  if (!allKeysPresent) return;
  const {
    mint_signature,
    price,
    presale,
    project_id,
  } = JSON.parse(req.body);

  const existing = await prisma.sales.findFirst({
    where: {
      mint_signature,
    },
  });

  if (existing) {
    res.status(400).json({ error: 'Signature already exists' });
    return;
  }
  let status: any = { err: true };
  const connection = new anchor.web3.Connection('https://api.devnet.solana.com');
  if (mint_signature) {
    status = await awaitTransactionSignatureConfirmation(
      mint_signature,
      30000,
      connection,
      true,
    );
  }
  if (!status || status.err) {
    res.status(400).json({ error: 'Signature not signed or invalid' });
    return;
  }

  await prisma.sales.create({
    data: {
      mint_signature: mint_signature as string,
      price: Number(price),
      presale,
      project: {
        connect: { id: project_id },
      },
    },
  });
  res.status(200).json({ success: 'Added sales analytics' });
}
