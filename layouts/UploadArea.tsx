import React from 'react';
import ImageOutlinedIcon from '@material-ui/icons/ImageOutlined';
import { Box, Container } from '@material-ui/core';
import { styled } from '@mui/material/styles';
import { FileUploader } from 'react-drag-drop-files';

type Props = {
  handleChange: any
  preview?: any,
  label?: string,
  accept?: string[],
  multiple?: boolean
  error?: string
  descriptionText?: string
  titleText?: string
};

export const UploadContainer = styled(Container)({
  '&': {
    background: 'white',
    color: 'black',
    borderRadius: '.75rem',
    border: '2px dashed #756C6C',
    height: '20rem',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    transition: '300ms',
    padding: '0',
    '&:hover': {
      border: '2px dashed black',
    },
  },
});

export const UploadArea = function UploadArea({
  handleChange, preview, label, error, accept, multiple, descriptionText, titleText,
}: Props) {
  return (
    <>
      <span
        className="text-gray-100 text-lg w-max"
        style={{
          marginRight: '100%',
        }}
      >
        {label}
      </span>
      <FileUploader
        handleChange={handleChange}
        types={accept}
        multiple={multiple || false}
      >
        <UploadContainer style={{ backgroundImage: `url(${preview})`, borderColor: error ? '#FF6262' : '' }}>
          <Box
            component="span"
          >
            <div style={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
            >
              <ImageOutlinedIcon style={{ width: '50px', height: '50px' }} />
              <p className="text-[1rem]">{titleText || 'Drag files or click to browse'}</p>
              <p className="text-gray-400 text-[.85rem] max-w-xs text-center">{descriptionText || 'PNG / APNG format'}</p>

            </div>

          </Box>
          <span
            className="text-left w-max text-error-light text-sm"
            style={{ marginRight: '100%' }}
          >
            {error}

          </span>
        </UploadContainer>
      </FileUploader>

    </>

  );
};
