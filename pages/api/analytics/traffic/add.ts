import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import {
  verifyMethod,
  verifyKeys,
} from '@/lib/server';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const allowed = verifyMethod(req, res, 'POST');
  if (!allowed) return;
  const requiredKeys = ['presale', 'project_id'];
  const allKeysPresent = verifyKeys(req, res, requiredKeys);
  if (!allKeysPresent) return;
  const {
    presale,
    project_id,
  } = JSON.parse(req.body);

  await prisma.traffic.create({
    data: {
      presale,
      project: {
        connect: { id: project_id },
      },
    },
  });
  res.status(200).json({ success: 'Added traffic analytics' });
}
