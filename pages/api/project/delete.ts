import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import {
  verifyKeys,
  verifyMethod,
} from '@/lib/server';
import prisma from '@/lib/prisma';
import { verifyExistingUser } from '@/lib/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const allowed = verifyMethod(req, res, 'DELETE');
  if (!allowed) return;
  try {
    const requiredKeys = ['signature', 'public_key', 'id'];
    const allKeysPresent = verifyKeys(req, res, requiredKeys);
    if (!allKeysPresent) return;

    const { signature, public_key, id,
    } = JSON.parse(req.body);
    if (!signature?.signature.data) return;

    const user = await prisma.user.findFirst({
      where: { public_key },
    });
    if (!user) {
      res.status(200).json({ error: 'User not found' });
      return;
    }
    const authenticated = await verifyExistingUser(
      user.nonce,
      user.public_key,
      signature,
      res,
    );

    if (!authenticated) return;

    const project = await prisma.project.findFirst({
      where: {
        id: Number(id),
        owner_id: user.id,
      },
    });

    if (!project) {
      res.status(200).json({ error: 'Project linked with the public key not found' });
      return;
    }
    const cache = await prisma.cache.findFirst({
      where: {
        project_id: project.id,
      },
    });

    if (cache) {
      await prisma.item.deleteMany({
        where: {
          cache_id: cache.id,
        },
      });
      await prisma.cache.delete({
        where: {
          id: cache.id,
        },
      });
    }
    await prisma.traffic.deleteMany({
      where: { project_id: project.id },
    });
    await prisma.sales.deleteMany({
      where: { project_id: project.id },
    });
    await prisma.site.delete({
      where: { project_id: project.id },
    });
    await prisma.project.delete({
      where: { id: project.id },
    });

    res.status(200).json({ success: 'Successfully deleted project' });
    return;
  } catch (e) {
    console.error('Request error', e);
    res.status(500).json({
      error: 'Error adding item',
    });
  }
}
