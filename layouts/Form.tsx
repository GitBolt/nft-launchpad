import React from 'react';
import Image from 'next/image';
import {
  Button,
  Container,
  Box,
  Stack,
} from '@mui/material';
import { ArrowForward, ArrowBackIos } from '@material-ui/icons';

interface Props {
  children?: React.ReactNode
  onSubmit: React.MouseEventHandler<HTMLButtonElement>
  image?: any
  heading: string
  buttonText: string
  disableButton?: boolean
  width: 'small' | 'medium' | 'large'
  gap?: string,
  topMargin?: string,
  customButton?: boolean,
  buttonWidth?: string,
  secondButton?: React.MouseEventHandler<HTMLButtonElement>
  enableSecondButton?: boolean
}

export const Form = function Form(props: Props) {
  let containerWidth;
  if (props.width === 'small') {
    containerWidth = '35rem';
  } else if (props.width === 'medium') {
    containerWidth = '46.25rem';
  } else {
    containerWidth = '60vw';
  }
  return (
    <Container
      style={{
        background: '#16161F',
        borderRadius: '1rem',
        textAlign: 'center',
        padding: '2rem',
        position: 'relative',
        width: containerWidth,
        marginTop: props.topMargin || '6rem',
        marginBottom: '2rem',
        border: '1px solid #1F1F2B',
      }}
    >
      <Box sx={{
        left: '0',
        top: '-75px',
        position: 'absolute',
        width: '100%',
      }}
      >
        {props.image && <Image width="120%" height="120%" src={props.image} alt="Form image"/>}
      </Box>
      <h1 className="text-3xl font-bold text-white mt-12 mb-8">
        {props.heading}
      </h1>
      <Box sx={{
        display: 'flex',
        flexFlow: 'column',
        gap: props.gap ? props.gap : '20px',
        padding: '10px',
      }}
      >
        {props.children}
        {props.customButton ? null : (
          <Stack spacing={2} direction="row" marginTop={props.gap || '2rem'}>
            {props.secondButton && (
            <Button
              onClick={props.secondButton}
              size="large"
              startIcon={<ArrowBackIos />}
              fullWidth
              variant="contained"
              style={{
                background: !props.enableSecondButton && props.disableButton ? '#9BB7ED' : '#0E2C97',
                height: '3rem',
                width: '100%',
                alignSelf: 'end',
                borderRadius: '.5rem',
              }}
              disabled={!props.enableSecondButton && props.disableButton}
            >
              Go back
            </Button>
            )}
            <Button
              onClick={props.onSubmit}
              size="large"
              endIcon={<ArrowForward />}
              fullWidth
              variant="contained"
              color="primary"
              style={{
                background: props.disableButton ? '#9BB7ED' : '#0E2C97',
                height: '3rem',
                width: props.buttonWidth || '100%',
                marginLeft: !props.secondButton ? 'auto' : '3rem',
                borderRadius: '.5rem',
              }}
              disabled={props.disableButton}
            >
              {props.buttonText}
            </Button>
          </Stack>
        )}
      </Box>
    </Container>
  );
};
