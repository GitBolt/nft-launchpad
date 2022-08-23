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
  const allowed = verifyMethod(req, res, 'POST');
  if (!allowed) return;
  try {
    const requiredKeys = ['signature', 'public_key', 'project_id'];
    const allKeysPresent = verifyKeys(req, res, requiredKeys);
    if (!allKeysPresent) return;

    const {
      candy_machine,
      uuid,
      signature,
      public_key,
      whitelist_mint,
      network,
      dynamicMint,
      dmConfigs,
      project_id,
    } = JSON.parse(req.body);

    if (!signature?.signature.data) return;

    const user = await prisma.user.findFirst({
      where: { public_key },
    });

    if (!user) {
      res.status(400).json({ error: 'User not found' });
      return;
    }
    const cache_exists = await prisma.cache.findFirst({
      where: {
        project: {
          id: Number(project_id),
        },
      },
    });

    if (!cache_exists) {
      res.status(400).json({ error: 'Cache does not exist' });
      return;
    }

    const authenticated = await verifyExistingUser(
      user.nonce,
      user.public_key,
      signature,
      res,
    );

    if (!authenticated) return;

    const updated = await prisma.cache.update({
      where: { id: cache_exists.id },
      data: {
        candy_machine: candy_machine || cache_exists.candy_machine,
        uuid: uuid || cache_exists.uuid,
        network: network || cache_exists.network,
        whitelist_mint: whitelist_mint || cache_exists.whitelist_mint,
        dynamicMint: dynamicMint || cache_exists.dynamicMint,
        dmConfigs: dmConfigs || cache_exists.dmConfigs,
      },
    });
    res.status(200).json({ success: 'Cache updated', cache: updated });
  } catch (e) {
    console.error('Request error', e);
    res.status(500).json({
      error: 'Error updating cache',
    });
  }
}
