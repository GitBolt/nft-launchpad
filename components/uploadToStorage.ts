import { NFTStorage } from 'nft.storage';

export const uploadFile = async (image: File, index: number) => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDk3NmI0N0ZlQUNlRDEzOTIyMTZBMzkwZmE4Yjg0RWI0MzYxN2M1NzAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0NjY2NTgzNjM1MiwibmFtZSI6InNvbHJhenIifQ.EjhbOlg-qsVQvSH-l8544IUpQZS1QWaqA64jj7xR0lM';
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
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDk3NmI0N0ZlQUNlRDEzOTIyMTZBMzkwZmE4Yjg0RWI0MzYxN2M1NzAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0NjY2NTgzNjM1MiwibmFtZSI6InNvbHJhenIifQ.EjhbOlg-qsVQvSH-l8544IUpQZS1QWaqA64jj7xR0lM';
    const client = new NFTStorage({ token });
    const manifestObject = JSON.parse(manifest);
    if (!manifestObject) return undefined;

    if (manifestObject.properties?.files) {
      manifestObject.properties.files.uri = image;
    } else if (typeof(manifestObject.properties?.files) === 'object') {
      manifestObject.properties.files[0].uri = image;
    } else {
      manifestObject.image = image;
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
