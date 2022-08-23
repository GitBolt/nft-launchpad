import Queue from 'queue-promise';
import { uploadFile, uploadManifest } from '@/components/uploadToStorage';
import { updateCache } from '@/components/cache';
import toast from 'react-hot-toast';

export const uploadAssets = (
  files: FileList,
  setFiles: React.Dispatch<React.SetStateAction<FileList | null>>,
  uploadedFileCount: number,
  resumeCount: number,
  missingIndexes: string[],
  setProgress: React.Dispatch<React.SetStateAction<number>>,
  setUploading: React.Dispatch<React.SetStateAction<boolean>>,
  setUploadedFileCount: React.Dispatch<React.SetStateAction<number>>,
  publicKey: string,
  setQueue: any,
  setUploadPage: any,
  project_id: number,

) => {
  const JSONFiles = Array.from(files).filter((file: File) => file.name.endsWith('.json')).sort(
    (a, b) => Number(b.name.split('.')[0]) - Number(a.name.split('.')[0]),
  );
  const PNGFiles = Array.from(files).filter((file: File) => file.name.endsWith('.png')).sort(
    (a, b) => Number(a.name.split('.')[0]) - Number(b.name.split('.')[0]),
  );
  const resumeIndex = PNGFiles.map((item) => item.name).indexOf(`${resumeCount}.png`);
  let resumePNGs: File[] = [];
  if (resumeIndex !== -1) {
    resumePNGs = PNGFiles.slice(resumeIndex, PNGFiles.length);
  }
  const missingPNGs = PNGFiles.filter((file: File) => missingIndexes.includes(file.name));
  const allPNGs = missingPNGs.concat(resumePNGs);
  const queue = new Queue({
    concurrent: 1,
    interval: 0,
  });
  allPNGs.forEach((file: File, index: number) => {
    queue.enqueue(async () => {
      let uploadedImage = await uploadFile(file, index);
      if (!uploadedImage) {
        toast.error('Failed to upload image, trying again');
        uploadedImage = await uploadFile(file, index);
        if (!uploadedImage) toast.error('Failed to upload image, please try again a while later');
        return;
      }
      const jsonForImage: any = JSONFiles.find((jsonFile: File) => jsonFile.name.split('.')[0] === (file.name.split('.')[0]));
      if (!jsonForImage || !uploadedImage) return;
      const jsonString = await jsonForImage.text();
      const finalURL = await uploadManifest(uploadedImage, jsonString);
      if (!finalURL) return;
      const { name } = JSON.parse(jsonString);
      await updateCache(
        finalURL,
        name.match(/\d/g).join(''),
        uploadedImage,
        publicKey,
        project_id,
      );
      setUploadedFileCount((prevState) => prevState + 1);
      const prog = Math.round(((uploadedFileCount + index + 1) / allPNGs.length) * 100);
      setProgress(prog);
      if (prog === 100) {
        setUploading(false);
        setFiles(null);
        setUploadedFileCount(0);
        setTimeout(() => {
          setUploadPage(false); setProgress(0); setQueue(undefined);
        }, 2000);
      }
    });
  });
  return queue;
};
