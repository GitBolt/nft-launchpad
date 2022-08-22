import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import prisma from '@/lib/prisma';
import { verifyMethod } from '@/lib/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const methodIsAllowed = verifyMethod(req, res, 'GET');
  if (!methodIsAllowed) return;
  const { public_key, showOnChainOnly, offset, project_id } = req.query;
  const offsetInt = Number(offset) * 30;
  if (!public_key || !project_id) return;
  try {
    if (showOnChainOnly) {
      const items = await prisma.item.findMany({
        where: {
          cache: {
            project: {
              id: Number(project_id),
            },
          },
          on_chain: true,
        },
      });
      const offsetItems = items.slice(offsetInt, offsetInt + 30);
      res.status(200).json({ count: offsetItems.length, items: offsetItems });
      return;
    }
    const items = await prisma.item.findMany({
      where: {
        cache: {
          project: {
            id: Number(project_id),
          },
        },
      },
    });
    const offsetItems = items.slice(offsetInt, offsetInt + 30);
    console.log(offsetItems.length);
    res.status(200).json({
      count: offsetItems.length,
      items: offsetItems.sort((a, b) => Number(a.name) - Number(b.name)),
    });
  } catch (error) {
    console.error('Request error', error);
    res.status(500).json({
      error: 'Error finding count',
    });
  }
}
