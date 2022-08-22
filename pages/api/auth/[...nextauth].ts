import prisma from '@/lib/prisma';
import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';
import { getTwitterUsername } from '@/components/twitter';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TWITTER_CONSUMER_KEY: string;
      TWITTER_CONSUMER_SECRET: string;
      TWITTER_ACCESS_TOKEN: string;
    }
  }
}

export default NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CONSUMER_KEY,
      clientSecret: process.env.TWITTER_CONSUMER_SECRET,
    }),
  ],
  callbacks: {
    async signIn({
      user,
    }) {
      const username = await getTwitterUsername(user.id);
      if (!username) return false;
      const project = await prisma.project.findFirst({
        where: {
          twitter_username: username,
          active: false,
        },
      });
      if (!project) return false;
      const updated = await prisma.project.update({
        where: { id: project.id },
        data: {
          twitter_username: username,
          active: true,
        },
      });
      return updated.twitter_username === project.twitter_username;
    },
    redirect() {
      return `${process.env.API_URL}/dashboard`;
    },
  },
  pages: {
    signIn: '/pages/auth/signin',
    error: '/auth/error',
  },
});
