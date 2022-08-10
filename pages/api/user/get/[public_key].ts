import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import prisma from '@/lib/prisma';
import { verifyMethod } from '@/lib/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const methodIsAllowed = verifyMethod(req, res, 'GET');
  if (!methodIsAllowed) return;
  const { public_key } = req.query;
  if (!public_key) return;
  try {
    const user = await prisma.user.findFirst({
      where: { public_key: public_key as string },
    });
    if (!user) {
      res.status(400).json({ error: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Request error', error);
    res.status(500).json({
      error: 'Error fetching user',
    });
  }
}
