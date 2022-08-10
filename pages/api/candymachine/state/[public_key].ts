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
      const cache = await prisma.cache.findFirst({
        where: {
          project: {
            owner: {
              public_key: public_key as string,
            },
          },
        },
      });
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
      const totalCount = await prisma.item.count({
        where: {
          cache: {
            project: {
              owner: {
                public_key: public_key as string,
              },
            },
          },
        },
      });
      let deployed = false
      if(onChainCount > 0 && onChainCount === totalCount) { deployed = true}
      return res.status(200).json({
        candyMachine: cache?.candy_machine || null, 
        deployed, 
        itemCount: totalCount, 
        network: cache?.network || null,
        whitelist_mint: cache?.whitelist_mint
      })
    } catch (error) {
      console.error('Request error', error);
      res.status(500).json({
        error: 'Error fetching user',
      });
    }
  }
  