import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import prisma from '@/lib/prisma';
import { verifyMethod } from '@/lib/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const methodIsAllowed = verifyMethod(req, res, 'GET');
  if (!methodIsAllowed) return;
  const { public_key, id, all } = req.query;
  if (!public_key) return;
  try {
    const user = await prisma.user.findFirst({
      where: { public_key: public_key as string },
    });
    if (!user) {
      res.status(400).json({ error: 'User not found' });
      return;
    }

    if (all) {
      const projects = await prisma.project.findMany({
        where: {
          owner_id: user.id,
        },
      });
      if (!projects) {
        res.status(400).json({
          error: 'Projects do not exist',
        });
        return;
      }
      res.status(200).json({
        projects,
      });
      return;
    }
    const project = await prisma.project.findFirst({
      where: {
        owner_id: user.id,
        id: Number(id),
      },
    });
    if (!project) {
      res.status(400).json({
        error: 'Project does not exist',
      });
      return;
    }

    if (!project.active) {
      res.status(403).json({
        error: 'Project is not active',
      });
      return;
    }

    const site = await prisma.site.findFirst({
      where: {
        project_id: project.id,
      },
    });
    res.status(200).json({
      project,
      site,
    });
  } catch (error) {
    console.error('Request error', error);
    res.status(500).json({
      error: 'Error fetching user',
    });
  }
}
