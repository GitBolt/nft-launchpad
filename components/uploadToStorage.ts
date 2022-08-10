import { NFTStorage } from 'nft.storage';

export const uploadFile = async (image: File, index: number) => {
  const token = process.env.NEXT_PUBLIC_STORAGE_KEY as string;
  const client = new NFTStorage({ token });
  console.log(`Uploading image: ${image.name} with index ${index}`);
  const metadata = await client.store({
    name: 'My sweet NFT',
    description: 'Just try to funge it. You can\'t do it.',
    image,
  });
  const rawURL = metadata.embed().image;
  const masala = rawURL.toString().split('/ipfs/')[1];
  const imageURL = `https://ipfs.io/ipfs/${masala}`;
  console.log(`🎉 Uploaded image ${index}: ${imageURL}`);
  return imageURL;
};

export const uploadManifest = async (image: string, manifest: string) => {
  try {
    console.log('Uploading manifest...');
    const token = process.env.NEXT_PUBLIC_STORAGE_KEY as string;
    const client = new NFTStorage({ token });
    const manifestObject = JSON.parse(manifest);
    if (!manifestObject) return undefined;
    if (manifestObject && manifestObject.properties && manifestObject.image && manifestObject.properties.files) {
      manifestObject.properties.files[0].uri = image;
      manifestObject.image = image;
    } else {
      return;
    }
    const manifestBuffer = Buffer.from(JSON.stringify(manifestObject));
    const cid = await client.storeBlob(new Blob([manifestBuffer]));
    const link = `https://${cid}.ipfs.dweb.link`;
    console.log(`🎉 Uploaded manifest: ${link}`);
    return link;
  } catch (e) {
    console.error(e);
    return undefined;
  }
};
