import React, { useState } from 'react';
import { UploadArea } from '@/layouts/UploadArea';
import Button from '@material-ui/core/Button';
import PublishRounded from '@material-ui/icons/PublishRounded';
import { uploadAssets } from '@/util/handleCollection';
import PromiseQueue from 'queue-promise';
import { UploadStateHandler } from '@/layouts/UploadStateHandler';
import toast from 'react-hot-toast';

type Props = {
  uploadPage: boolean
  setUploadPage: React.Dispatch<React.SetStateAction<boolean>>
  setFiles: React.Dispatch<React.SetStateAction<FileList | null>>
  files: FileList,
  missingIndexes: string[]
  uploadedFileCount: number
  setUploadedFileCount: React.Dispatch<React.SetStateAction<number>>
  resumeCount: number
  publicKey: string
  hideUploadArea?: boolean
  totalCount: number,
  project_id: number,
};

export const UploadCollectionArea = function UploadCollectionArea({
  uploadPage,
  setUploadPage,
  setFiles,
  files,
  missingIndexes,
  uploadedFileCount,
  setUploadedFileCount,
  resumeCount,
  publicKey,
  hideUploadArea,
  totalCount,
  project_id,
}: Props) {
  const [progress, setProgress] = useState<number>(0);
  const [filesLength, setFilesLength] = useState<number>(0);
  const [queue, setQueue] = useState<PromiseQueue>();
  const [uploading, setUploading] = useState(false);
  return (
    <div className="mt-[1rem] flex flex-col gap-8">
      {!uploadPage && !hideUploadArea && (
      <UploadArea
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
          if (!(PNGFiles.map((e) => e.name).includes(`${resumeCount}.png`))) {
            toast.error('Invalid image file number');
            return;
          }
          if (!(JSONFiles.map((e) => e.name).includes(`${resumeCount}.json`))) {
            toast.error('Invalid JSON file number');
            return;
          }
          setFiles(getFiles);
        }}
        descriptionText={files ? 'You are good to go! Click on Start Uploading button to continue.' : 'Select all the PNGs and the associated JSON files'}
        titleText={files ? `Selected ${files.length / 2} PNGs and JSONs` : 'Drag files or Click here to browse '}
      />
      )}
      {files && !uploadPage && (
        <>
          <div className="fixed w-full h-full bg-[#000000c5] z-10" style={{ transform: 'translate(-2%, -10%)' }} />
          <div
            className="bg-[#0F0F16] h-[15rem] max-w-[40rem] w-[40vw] fixed self-center flex-col flex items-center justify-center z-10 rounded-2xl"
            style={{
              transform: 'translate(10%, 50%)',
            }}
          >
            <h1 className="text-2xl text-gray-200 font-bold mb-5">{`Selected ${files.length / 2} PNGs and ${files.length / 2} JSONs`}</h1>
            <Button
              style={{
                borderRadius: '.5rem',
                padding: '.5rem 2rem',
                fontSize: '1rem',
                background: '#0E2C97',
                color: 'white',
                alignSelf: 'center',
              }}
              endIcon={<PublishRounded />}
              onClick={() => {
                setUploading(true);
                setUploadPage(true);
                const PNGFiles = Array.from(files).filter((file: File) => file.name.endsWith('.png')).sort(
                  (a, b) => Number(a.name.split('.')[0]) - Number(b.name.split('.')[0]),
                );
                const resumeIndex = PNGFiles.map((item) => item.name).indexOf(`${resumeCount}.png`);
                let resumePNGs: File[] = [];
                if (resumeIndex !== -1) {
                  resumePNGs = PNGFiles.slice(resumeIndex, PNGFiles.length);
                }

                const missingPNGs = PNGFiles.filter((file: File) => missingIndexes.includes(
                  file.name,
                ));
                const allPNGs = missingPNGs.concat(resumePNGs);
                setFilesLength(allPNGs.length);
                const uploadQueue = uploadAssets(
                  files,
                  setFiles,
                  uploadedFileCount,
                  resumeCount,
                  missingIndexes,
                  setProgress,
                  setUploading,
                  setUploadedFileCount,
                  publicKey,
                  setQueue,
                  setUploadPage,
                  project_id,
                );
                if (uploadQueue) {
                  setQueue(uploadQueue);
                  setUploading(true);
                } else {
                  setUploading(false);
                }
              }}
            >
              Start Uploading
            </Button>
          </div>
        </>
      )}
      {uploadPage && (uploadedFileCount ? totalCount : true) ? (
        <UploadStateHandler
          queue={queue!}
          progress={progress!}
          uploadedFileCount={uploadedFileCount}
          setUploading={setUploading}
          uploading={uploading}
          totalCount={totalCount}
          filesLength={filesLength}
        />
      ) : null}
      {(!progress && resumeCount)
        ? (
          <p className="text-left text-bold relative text-gray-200 bottom-5 mt-2">
            If more NFTs are to be uploaded in this collection,
            then please select the entire selection at one go.
            The upload will auto-resume from the next file.
            {/* {' '}
            {resumeCount}
            .png and
            {' '}
            {resumeCount}
            .json
            {' '} */}
          </p>
        ) : null}
    </div>
  );
};
