import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import prisma from '@/lib/prisma';
import { verifyMethod } from '@/lib/server';
  
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const methodIsAllowed = verifyMethod(req, res, 'GET');
  if (!methodIsAllowed) return;
  const { project_id } = req.query;
  if (!project_id) return;
  try {
    const cache = await prisma.cache.findFirst({
      where: {
        project: {
          id: Number(project_id),
        },
      },
    });
    const onChainCount = await prisma.item.count({
      where: {
        cache: {
          project: {
            id: Number(project_id),
          },
        },
        on_chain: true,
      },
    });
    const totalCount = await prisma.item.count({
      where: {
        cache: {
          project: {
            id: Number(project_id),
          },
        },
      },
    });
    let deployed = false;
    if (onChainCount > 0 && onChainCount === totalCount) { deployed = true;}
    return res.status(200).json({
      candyMachine: cache?.candy_machine || null, 
      deployed, 
      itemCount: totalCount, 
      network: cache?.network || null,
      whitelist_mint: cache?.whitelist_mint,
      dynamicMint: cache?.dynamicMint,
      dmConfigs: cache?.dmConfigs,
    });
  } catch (error) {
    console.error('Request error', error);
    res.status(500).json({
      error: 'Error fetching user',
    });
  }
}
  