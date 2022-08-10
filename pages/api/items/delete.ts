import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import {
  verifyExistingUser,
  verifyKeys,
  verifyMethod,
} from '@/lib/server';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const allowed = verifyMethod(req, res, 'DELETE');
  if (!allowed) return;
  try {
    const requiredKeys = ['id', 'signature', 'public_key'];
    const allKeysPresent = verifyKeys(req, res, requiredKeys);
    if (!allKeysPresent) return;

    const {
      signature,
      public_key,
      id,
    } = JSON.parse(req.body);
    const intId = Number(id);

    if (!signature?.signature.data) return;

    const user = await prisma.user.findFirst({
      where: { public_key },
    });
    if (!user) {
      res.status(400).json({ error: 'User not found' });
      return;
    }
    const authenticated = await verifyExistingUser(
      user.nonce,
      user.public_key,
      signature,
      res,
    );

    if (!authenticated) return;
    const nft = await prisma.item.findFirst({
      where: { id: intId },
    });
    if (!nft) {
      res.status(400).json({ success: 'NFT does not exist' });
    }
    await prisma.item.delete({
      where: { id: intId },
    });
    res.status(200).json({ success: 'Deleted NFT' });
  } catch (e) {
    console.error('Request error', e);
    res.status(500).json({
      error: 'Error deleting NFT',
    });
  }
}
