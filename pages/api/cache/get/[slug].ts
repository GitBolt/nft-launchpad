import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import prisma from '@/lib/prisma';
import { verifyMethod } from '@/lib/server';
import slugify from 'slugify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const methodIsAllowed = verifyMethod(req, res, 'GET');
  if (!methodIsAllowed) return;
  const { slug, ignoreItems } = req.query;
  if (!slug) return;
  const pSlug = slugify(slug as string).toLocaleLowerCase();
  try {
    const project = await prisma.project.findFirst({
      where: {
        slug: pSlug,
      },
    });
    if (!project) {
      res.status(400).json({
        error: 'Project does not exist',
      });
      return;
    }

    if (!project.active) {
      res.status(400).json({
        error: 'Project is not active',
      });
      return;
    }

    const cache = await prisma.cache.findFirst({
      where: {
        project_id: project.id,
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
    res.status(200).json({ ...cache });
  } catch (error) {
    console.error('Request error', error);
    res.status(500).json({
      error: 'Error fetching cache',
    });
  }
}
