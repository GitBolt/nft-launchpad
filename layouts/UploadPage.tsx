import React from 'react';
import Image from 'next/image';
import Upload from '@/images/upload.png';
import Button from '@material-ui/core/Button';
import PublishRounded from '@material-ui/icons/PublishRounded';
import toast from 'react-hot-toast';
import { FileUploader } from 'react-drag-drop-files';

interface Props {
  setFiles: React.Dispatch<React.SetStateAction<FileList | null>>
  totalCount: number
  filesSelected: boolean
}
export const UploadPage = function UploadPage({ setFiles, totalCount, filesSelected }: Props) {
  return (
    <div className="mt-[1rem] flex flex-col items-center justify-center gap-6 h-[40rem] px-5">
      <Image src={Upload} height="200" width="200" alt="Art"/>
      <h1 className="text-[#CDCDCD] font-bold text-3xl text-center max-w-[30rem]">Get started with uploading your collection</h1>
      <p className="text-[#828282] text-center max-w-[30rem]">Please select both PNG and JSON files to get started. We recommend that you select the entire collection at one go. You can pause the upload whenever desired.</p>
      <FileUploader
        multiple
        handleChange={async (getFiles: FileList) => {
          if (!getFiles) { return; }
          const JSONFiles = Array.from(getFiles).filter((file: File) => file.name.endsWith('.json')).sort(
            (a, b) => Number(b.name.split('.')[0]) - Number(a.name.split('.')[0]),
          );
          const PNGFiles = Array.from(getFiles).filter((file: File) => file.name.endsWith('.png')).sort(
            (a, b) => Number(a.name.split('.')[0]) - Number(b.name.split('.')[0]),
          );
          if (PNGFiles.length !== JSONFiles.length) {
            toast.error('Number of PNG files and JSON files should be equal');
            return;
          }
          if (!(PNGFiles.map((e) => e.name).includes(`${totalCount}.png`))) {
            toast.error('Invalid image file number');
            return;
          }
          if (!(JSONFiles.map((e) => e.name).includes(`${totalCount}.json`))) {
            toast.error('Invalid JSON file number');
            return;
          }
          setFiles(getFiles);
        }}
      >
        {!filesSelected ? (
          <Button
            variant="contained"
            color="primary"
            style={{
              borderRadius: '.5rem',
              padding: '.65rem 2rem',
              fontSize: '1rem',
              minWidth: '20rem',
              background: '#0E2C97',
              color: 'white',
            }}
            endIcon={<PublishRounded />}
          >
            Upload collection

          </Button>
        ) : <div />}
      </FileUploader>

    </div>
  );
};
