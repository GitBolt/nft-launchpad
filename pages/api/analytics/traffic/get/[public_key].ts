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

    const traffic = await prisma.traffic.findMany({
      where: {
        project_id: project.id,
      },
    });
    if (!traffic) {
      res.status(400).json({
        error: 'No traffic for the project found',
      });
      return;
    }
    const filterTraffic = traffic.map((value) => ({
      created_at: value.created_at,
      presale: value.presale,
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
    let presaleTraffic = 0;
    let publicsaleTraffic = 0;

    let presaleTraffic7Days = 0;
    let publicsaleTraffic7Days = 0;

    let publicsaleTrafficLastWeek = 0;
    let presaleTrafficLastWeek = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const item of filterTraffic) {
      if (item) {
        const day = item.created_at.getDate();
        const monthName = item.created_at.toLocaleString('default', { month: 'long' });
        const keyName = `${day} ${monthName}`;
        const dataType = item.presale ? presaleData : publicsaleData;
        if (item.presale) {
          presaleTraffic += 1;
          if (item.created_at.getMonth() === current.getMonth()
          && item.created_at.getDate() > current.getDate() - 7) {
            presaleTraffic7Days += 1;
          }
          if (item.created_at.getDate() > current.getDate() - 12
          && item.created_at.getDate() < current.getDate() - 7) {
            presaleTrafficLastWeek += 1;
          }
        } else {
          if (item.created_at.getMonth() === current.getMonth()
          && item.created_at.getDate() > current.getDate() - 7) {
            publicsaleTraffic7Days += 1;
          }
          publicsaleTraffic += 1;
          if (item.created_at.getDate() > current.getDate() - 12
          && item.created_at.getDate() < current.getDate() - 7) {
            publicsaleTrafficLastWeek += 1;
          }
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

    const publicsaleWeeklyGrowth = publicsaleTrafficLastWeek ? ((
      publicsaleTraffic7Days - publicsaleTrafficLastWeek) / publicsaleTrafficLastWeek
    ) * 100 : publicsaleTraffic7Days ? 100 : 0;
    const presaleWeeklyGrowth = presaleTrafficLastWeek ? ((
      presaleTraffic7Days - presaleTrafficLastWeek) / presaleTrafficLastWeek
    ) * 100 : presaleTraffic7Days ? 100 : 0;

    data.presale = presaleSorted;
    data.publicsale = publicsaleSorted;
    res.status(200).json({
      ...data,
      presaleTraffic,
      publicsaleTraffic,
      publicsaleTraffic7Days,
      presaleTraffic7Days,
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
