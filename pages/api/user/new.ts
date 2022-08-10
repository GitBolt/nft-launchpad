import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import {
  verifyKeys,
  verifyMethod,
  verifyNewUser,
} from '@/lib/server';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const allowed = verifyMethod(req, res, 'POST');
  if (!allowed) return;
  try {
    const requiredKeys = ['public_key', 'nonce', 'signature'];
    const allKeysPresent = verifyKeys(req, res, requiredKeys);
    if (!allKeysPresent) return;

    const authenticated = verifyNewUser(req, res);
    if (!authenticated) return;

    const {
      public_key,
      nonce,
    } = JSON.parse(req.body);

    const userExists = await prisma.user.findFirst({
      where: { public_key },
    });

    if (userExists) {
      res.status(400).json({
        error: 'User already exists',
      });
      return;
    }

    const newUser = await prisma.user.create({
      data: {
        public_key,
        nonce,
      },
    });
    res.status(200).json({ success: 'User created', user: newUser });
  } catch (e) {
    console.error('Request error', e);
    res.status(500).json({
      error: 'Error registering user',
    });
  }
}
