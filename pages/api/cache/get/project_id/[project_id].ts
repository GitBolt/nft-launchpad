import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import prisma from '@/lib/prisma';
import { verifyMethod } from '@/lib/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const methodIsAllowed = verifyMethod(req, res, 'GET');
  if (!methodIsAllowed) return;
  const { project_id, ignoreItems } = req.query;
  if (!project_id) return;
  try {
    const cache = await prisma.cache.findFirst({
      where: {
        project: {
          id: Number(project_id),
        },
      },
    });
    if (!cache) {
      res.status(400).json({
        error: 'Cache does not exist',
      });
      return;
    }
    if (!ignoreItems) {
      const items = await prisma.item.findMany({
        where: {
          cache_id: cache.id,
        },
      });
      res.status(200).json({ ...cache, items });
      return;
    }
    const item_count = await prisma.item.count({
      where: {
        cache: {
          // @ts-ignore
          project: {
            id: Number(project_id),
          },
        },
      },
    });
    res.status(200).json({ ...cache, count: item_count });
  } catch (error) {
    console.error('Request error', error);
    res.status(500).json({
      error: 'Error fetching cache',
    });
  }
}
