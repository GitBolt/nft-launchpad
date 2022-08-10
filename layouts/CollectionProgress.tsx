import React from 'react';
import LinearProgress from '@mui/material/LinearProgress';

type Props = {
  progress: number | null,
  uploadedFileCount: number,
  totalCount: number,
  filesLength: number,
};

export const CollectionProgress = function CollectionProgress({
  progress,
  uploadedFileCount,
  totalCount,
  filesLength,
}: Props) {
  if (!(typeof (progress) === 'number')) {
    return <div />;
  }
  if (progress === 100 && totalCount) {
    return (
      <div className="bg-success-light rounded-lg text-left p-3 w-full">
        <p className="text-success-dark ml-2">🎉 Wohoo! Upload successful</p>
      </div>
    );
  }
  return (
    <div className="w-full mt-2">
      <LinearProgress
        value={progress!}
        variant="determinate"
        sx={{
          padding: '.25rem',
          borderRadius: '1rem',
          background: '#7E838E',
        }}
      />
      <div className="flex mt-2">
        <div className="flex flex-col items-start justify-center">
          <p className="text-gray-200 font-bold">
            Total NFTs uploaded
            {' '}
            {totalCount}
          </p>
          <p className="text-gray-200 font-bold">
            Now uploading
            {' '}
            {uploadedFileCount + 1}
            /
            {filesLength}
          </p>
        </div>
        <p className="text-gray-300 ml-auto">
          {progress}
          % completed
        </p>

      </div>
    </div>
  );
};
