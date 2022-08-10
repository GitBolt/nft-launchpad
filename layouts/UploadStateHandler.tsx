import React from 'react';
import PromiseQueue from 'queue-promise';
import { CollectionProgress } from '@/layouts/CollectionProgress';
import Pause from '@material-ui/icons/Pause';
import PlayArrow from '@material-ui/icons/PlayArrow';

type Props = {
  uploadedFileCount: number
  setUploading: React.Dispatch<React.SetStateAction<boolean>>
  queue: PromiseQueue
  progress: number
  uploading: boolean
  filesLength: number
  totalCount: number
};

export const UploadStateHandler = function UploadStateHandler({
  setUploading,
  uploadedFileCount,
  queue,
  progress,
  uploading,
  filesLength,
  totalCount,
}: Props) {
  return (
    <div className="flex gap-4 items-end p-5 rounded-2xl" style={{ border: '1px solid #1F1F2B' }}>
      {queue && (progress !== 100) && (
        <div
          className="cursor-pointer hover:bg-blue-100 rounded-3xl p-1 mb-4 duration-100"
          onClick={() => {
            if (uploading) {
              queue.stop();
              setUploading(false);
            } else {
              queue.start();
              setUploading(true);
            }
          }}
        >
          {uploading ? <Pause style={{ color: '#404040' }} /> : <PlayArrow style={{ color: '#404040' }} />}
        </div>
      )}
      <CollectionProgress
        progress={progress}
        uploadedFileCount={uploadedFileCount}
        totalCount={totalCount}
        filesLength={filesLength}
      />
    </div>
  );
};
