import { postNetworkRequest } from '@/util/functions';
import { signNonce, connectWallet } from './wallet';

export const createCache = async (
  project_id: number,
  candy_machine: string,
  uuid: string,
) => {
  const signature = await signNonce();
  const public_key = await connectWallet(true, true);
  if (!signature) return;
  const data = {
    uuid,
    candy_machine,
    project_id,
    public_key,
    signature,
  };
  console.log(data);
  const response = await postNetworkRequest(
    data,
    '/api/cache/new',
    'Error creating cache',
  );
  console.log(response);
};

export const updateCache = async (
  item_link: string,
  name: string,
  assetUri: string,
  publicKey: string,
) => {
  const signature = await signNonce();
  if (!signature) return;
  const data = {
    signature,
    public_key: publicKey,
    item_link,
    assetUri,
  };
  const response = await postNetworkRequest(
    {
      ...data,
      name,
      on_chain: false,
    },
    '/api/cache/add',
    'Error adding item to cache',
  );
  return response;
};
