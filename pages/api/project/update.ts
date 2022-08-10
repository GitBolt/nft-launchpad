import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import {
  verifyKeys,
  verifyMethod,
} from '@/lib/server';
import prisma from '@/lib/prisma';
import slugify from 'slugify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const allowed = verifyMethod(req, res, 'POST');
  if (!allowed) return;
  try {
    const { onlyProject } = req.query;
    const requiredKeys = ['signature', 'public_key'];
    const allKeysPresent = verifyKeys(req, res, requiredKeys);
    if (!allKeysPresent) return;

    const {
      projectData, siteData, signature, public_key,
    } = JSON.parse(req.body);
    if (!signature?.signature.data) return;

    const user = await prisma.user.findFirst({
      where: { public_key },
    });
    if (!user) {
      res.status(200).json({ error: 'User not found' });
      return;
    }

    const project = await prisma.project.findFirst({
      where: {
        owner_id: user.id,
      },
    });

    if (!project) {
      res.status(200).json({ error: 'Project linked with the public key not found' });
      return;
    }

    const site = await prisma.site.findFirst({
      where: {
        project: {
          owner_id: user.id,
        },
      },
    });

    if (!site) {
      res.status(400).json({ error: 'Site does not exist' });
      return;
    }

    await prisma.project.update({
      where: { id: project.id },
      data: {
        slug: projectData.name ? slugify(projectData.name).toLowerCase() : project.slug,
        name: projectData.name || project.name,
        description: projectData.description || project.description,
        logo: projectData.logo || project.logo,
        banner: projectData.banner || project.banner,
        twitter_username: projectData.twitter_username || project.twitter_username,
      },
    });
    if (onlyProject) {
      res.status(200).json({ success: 'Successfully updated project' });
      return;
    }
    await prisma.site.update({
      where: { id: site.id },
      data: {
        bgColor: siteData.bgColor || site.bgColor,
        primaryFontColor: siteData.primaryFontColor || site.primaryFontColor,
        secondaryFontColor: siteData.secondaryFontColor || site.secondaryFontColor,
        buttonBgColor: siteData.buttonBgColor || site.buttonBgColor,
        buttonFontColor: siteData.buttonFontColor || site.buttonFontColor,
        fontFamily: siteData.fontFamily || site.fontFamily,
        align: siteData.align || site.align,
        header: siteData.header || site.header,
        sections: siteData.sections || site.sections,
        faqSection: siteData.faqSection || site.faqSection,
        tabs: siteData.tabs || site.tabs,
      },
    });
    res.status(200).json({ success: 'Successfully updated' });
    return;
  } catch (e) {
    console.error('Request error', e);
    res.status(500).json({
      error: 'Error adding item',
    });
  }
}
