import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import {
  verifyExistingUser,
  verifyKeys,
  verifyMethod,
} from '@/lib/server';
import prisma from '@/lib/prisma';
import slugify from 'slugify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const allowed = verifyMethod(req, res, 'POST');
  if (!allowed) return;
  try {
    const requiredKeys = ['name', 'description', 'twitter_username', 'public_key', 'signature'];
    const allKeysPresent = verifyKeys(req, res, requiredKeys);
    if (!allKeysPresent) return;

    const {
      name,
      description,
      discord_invite,
      twitter_username,
      logo,
      banner,
      public_key,
      signature,
    } = JSON.parse(req.body);
    if (!signature?.signature.data) return;

    const user = await prisma.user.findFirst({
      where: {
        public_key,
      },
    });
    if (!user) {
      res.status(400).json({ error: 'User not found' });
      return;
    }

    const slug = slugify(name).toLowerCase();
    const twitter = twitter_username.replace('@', '');

    const projectExists = await prisma.project.findFirst({
      where: {
        owner_id: user.id,
      },
    });

    if (projectExists) {
      res.status(400).json({ error: 'Project already exists' });
      return;
    }

    const nameTaken = await prisma.project.findFirst({
      where: {
        slug,
      },
    });

    if (nameTaken) {
      res.status(400).json({ error: 'Project name taken' });
      return;
    }

    const authenticated = await verifyExistingUser(
      user.nonce,
      user.public_key,
      signature,
      res,
    );

    if (!authenticated) return;
    const newProject = await prisma.project.create({
      data: {
        name,
        slug,
        description,
        discord_invite,
        twitter_username: twitter,
        logo,
        banner,
        owner: {
          connect: { id: user.id },
        },
      },
    });

    const site = await prisma.site.create({
      data: {
        project: {
          connect: { id: newProject.id },
        },
      },
    });

    const data = JSON.stringify([
      {
        id: 1, name: 'About', title: '', content: '', images: [],
      },
      {
        id: 2, name: 'Team', title: '', content: '', images: [],
      },
      {
        id: 3, name: 'Roadmap', title: '', content: '', images: [],
      },
      {
        id: 4, name: 'Details', title: '', content: '', images: [],
      },
      {
        id: 5, name: 'Backers', title: '', content: '', images: [],
      },
    ]);

    await prisma.site.update({
      where: { id: site.id },
      data: {
        tabs: data,
      },
    });

    res.status(200).json({ success: 'Project created', project: newProject });
  } catch (e) {
    console.error('Request error', e);
    res.status(500).json({
      error: 'Error creating project',
    });
  }
}
