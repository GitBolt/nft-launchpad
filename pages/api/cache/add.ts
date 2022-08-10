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
    const requiredKeys = ['name', 'signature', 'public_key', 'item_link', 'assetUri'];
    const allKeysPresent = verifyKeys(req, res, requiredKeys);
    if (!allKeysPresent) return;

    const {
      signature,
      public_key,
      item_link,
      name,
      assetUri,
    } = JSON.parse(req.body);

    if (!signature?.signature.data) return;

    const user = await prisma.user.findFirst({
      where: { public_key },
    });
    if (!user) {
      res.status(400).json({ error: 'User not found' });
      return;
    }

    const project = await prisma.project.findFirst({
      where: {
        owner_id: user.id,
      },
    });

    if (!project) {
      res.status(400).json({ error: 'Project linked with the public key not found' });
      return;
    }

    if (!project.active) {
      res.status(400).json({
        error: 'Project is not active',
      });
      return;
    }

    let cache;

    const existing_cache = await prisma.cache.findFirst({
      where: {
        project: {
          owner_id: user.id,
        },
      },
    });

    if (existing_cache) {
      cache = existing_cache;
    }

    if (!cache) {
      const new_cache = await prisma.cache.create({
        data: {
          project: {
            connect: {
              id: project.id,
            },
          },
        },
      });
      cache = new_cache;
    }

    const authenticated = await verifyExistingUser(
      user.nonce,
      user.public_key,
      signature,
      res,
    );

    if (!authenticated) return;

    const new_item = await prisma.item.create({
      data: {
        name,
        link: item_link,
        assetUri,
        on_chain: false,
        verify_run: false,
        cache_id: cache.id,
      },
    });
    res.status(200).json({ success: 'New item created', new_item });
  } catch (e) {
    console.error('Request error', e);
    res.status(500).json({
      error: 'Error adding item',
    });
  }
}
