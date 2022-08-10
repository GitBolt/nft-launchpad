/* eslint-disable no-nested-ternary */
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
  try {
    const user = await prisma.user.findFirst({
      where: { public_key: public_key as string },
    });

    if (!user) {
      res.status(400).json({ error: 'User does not exist' });
      return;
    }
    const project = await prisma.project.findFirst({
      where: {
        owner_id: user.id,
      },
    });
    if (!project) {
      res.status(400).json({ error: 'Project does not exist' });
      return;
    }

    if (!project.active) {
      res.status(400).json({
        error: 'Project is not active',
      });
      return;
    }

    const items = await prisma.item.findMany({
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

    if (!items) {
      res.status(400).json({
        error: 'Items not found',
      });
      return;
    }
    const sales = await prisma.sales.findMany({
      where: {
        project_id: project.id,
      },
    });

    if (!sales) {
      res.status(400).json({
        error: 'No sales for the project found',
      });
      return;
    }
    const filterSales = sales.map((value) => ({
      created_at: value.created_at,
      presale: value.presale,
      price: value.price,
    }));

    type Sale = {
      [key: string]: number
    };
    type Data = {
      presale: Sale
      publicsale: Sale
    };
    const current = new Date();

    const presaleData: Sale = {};
    const publicsaleData: Sale = {};
    const data: Data = { presale: {}, publicsale: {} };
    let presaleSols = 0;
    let publicsaleSols = 0;

    let presaleSols7Days = 0;
    let publicsaleSols7Days = 0;

    let publicsaleSolsThisWeek = 0;
    let presaleSolsThisWeek = 0;
    let publicsaleSolsLastWeek = 0;
    let presaleSolsLastWeek = 0;
    let mintedCount = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const item of filterSales) {
      if (item) {
        mintedCount += 1;
        const day = item.created_at.getDate();
        const monthName = item.created_at.toLocaleString('default', { month: 'long' });
        const keyName = `${day} ${monthName}`;
        const dataType = item.presale ? presaleData : publicsaleData;
        if (item.presale) {
          if (item.created_at.getMonth() === current.getMonth()
          && item.created_at.getDate() > current.getDate() - 7) {
            presaleSols7Days += item.price;
          }
          if (item.created_at.getMonth() === current.getMonth()) {
            presaleSolsThisWeek += item.price;
          }
          if (item.created_at.getMonth() === current.getMonth() - 1) {
            presaleSolsLastWeek += item.price;
          }
          presaleSols += item.price;
        } else {
          if (item.created_at.getMonth() === current.getMonth()
          && item.created_at.getDate() > current.getDate() - 7) {
            publicsaleSols7Days += item.price;
          }
          if (item.created_at.getMonth() === current.getMonth()) {
            publicsaleSolsThisWeek += item.price;
          }
          if (item.created_at.getMonth() === current.getMonth() - 1) {
            publicsaleSolsLastWeek += item.price;
          }
          publicsaleSols += item.price;
        }
        if (!(keyName in dataType)) {
          dataType[keyName] = 1;
        } else {
          dataType[keyName] += 1;
        }
      }
    }
    const presaleSorted = Object.fromEntries(Object.entries(presaleData).sort());
    const publicsaleSorted = Object.fromEntries(Object.entries(publicsaleData).sort());
    const publicsaleWeeklyGrowth = publicsaleSolsLastWeek ? ((
      publicsaleSolsThisWeek - publicsaleSolsLastWeek) / publicsaleSolsLastWeek
    ) * 100 : publicsaleSolsThisWeek ? 100 : 0;
    const presaleWeeklyGrowth = presaleSolsLastWeek ? ((
      presaleSolsThisWeek - presaleSolsLastWeek) / presaleSolsLastWeek
    ) * 100 : presaleSolsThisWeek ? 100 : 0;
    data.presale = presaleSorted;
    data.publicsale = publicsaleSorted;
    res.status(200).json({
      ...data,
      mintedCount,
      nftsLeft: items.length - mintedCount,
      presaleSols,
      publicsaleSols,
      presaleSols7Days,
      publicsaleSols7Days,
      publicsaleWeeklyGrowth,
      presaleWeeklyGrowth,
    });
  } catch (error) {
    console.error('Request error', error);
    res.status(500).json({
      error: 'Error fetching project',
    });
  }
}
