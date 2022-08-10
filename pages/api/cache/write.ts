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
    const requiredKeys = ['items', 'signature', 'public_key'];
    const allKeysPresent = verifyKeys(req, res, requiredKeys);
    if (!allKeysPresent) return;

    const {
      items,
      public_key,
      signature,
    } = JSON.parse(req.body);

    if (!signature?.signature.data) return;

    const project = await prisma.project.findFirst({
      where: {
        owner: {
          public_key,
        },
      },
    });

    if (!project) {
      res.status(400).json({ error: 'Project not found' });
      return;
    }

    if (!project.active) {
      res.status(400).json({
        error: 'Project is not active',
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        public_key,
      },
    });

    if (!user) {
      res.status(400).json({ error: 'User not found' });
      return;
    }

    const cache = await prisma.cache.findFirst({
      where: {
        project: {
          id: project.id,
        },
      },
    });

    if (!cache) {
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

    const item_array: number[] = Array.from(items);
    if (item_array.length === 0) {
      res.status(400).json({ error: 'No items provided' });
      return;
    }

    let updatedCount = 0;

    item_array.forEach(async (id) => {
      const updated = await prisma.item.update({
        where: { id },
        data: {
          on_chain: true,
        },
      });
      if (updated.on_chain) updatedCount += 1;
    });
    res.status(200).json({ success: 'Items updated', count: updatedCount });
  } catch (e) {
    console.error('Request error', e);
    res.status(500).json({
      error: 'Error writing item',
    });
  }
}
