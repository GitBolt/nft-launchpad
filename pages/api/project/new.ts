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
        title: 'About us',
        content: 'Your team details',
        align: 'left',
        image: 'https://media.discordapp.net/attachments/865444983762452520/978948282040586270/Rectangle_1521.png',
        imageAlign: 'left',
        bgColor: 'black',
        fontColor: 'white',
        wideImage: true,
      },
      {
        title: 'Roadmap',
        content: 'Your roadmap',
        align: 'right',
        image: 'https://media.discordapp.net/attachments/865444983762452520/978948282040586270/Rectangle_1521.png',
        imageAlign: 'right',
        bgColor: '#000a22',
        fontColor: '#ffffff',
        wideImage: false,
      },
      {
        title: 'Team',
        content: 'Your team',
        align: 'left',
        image: 'https://media.discordapp.net/attachments/865444983762452520/978948282040586270/Rectangle_1521.png',
        imageAlign: 'left',
        bgColor: '#000000',
        fontColor: '#ffffff',
        wideImage: true,
      },
    ]);

    await prisma.site.update({
      where: { id: site.id },
      data: {
        sections: data,
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