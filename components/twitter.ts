import fetch from 'node-fetch';

interface Data {
  username: string | undefined;
}

export const getTwitterUsername = async (id: string) => {
  const request = await fetch(`https://api.twitter.com/2/users/${id}`, {
    headers: {
      Authorization: `Bearer ${process.env.TWITTER_ACCESS_TOKEN}`,
    },
  });
  const response: any = await request.json();
  const { data } = response;
  const { username }: Data = data;
  return username;
};
