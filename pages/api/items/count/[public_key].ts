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
    const onChainCount = await prisma.item.count({
      where: {
        cache: {
          project: {
            owner: {
              public_key: public_key as string,
            },
          },
        },
        on_chain: true,
      },
    });

    const offChainCount = await prisma.item.count({
      where: {
        cache: {
          project: {
            owner: {
              public_key: public_key as string,
            },
          },
        },
        on_chain: false,
      },
    });
    res.status(200).json({ onChainCount, offChainCount });
  } catch (error) {
    console.error('Request error', error);
    res.status(500).json({
      error: 'Error finding count',
    });
  }
}
