import {
  TextField,
  Grid,
} from '@mui/material';
  
import { styled } from '@mui/material/styles';
  
export const Text = styled(TextField)({
  label: {
    color: '#606163',
  },
  input: {
    color: 'white',
  },
  '& fieldset': {
    color: 'white',
  },
  '& label.Mui-focused': {
    color: 'white',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: '#606163',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'none',
    },
  },
});
  
export const PageRoot = styled(Grid)({
  '&': {
    minHeight: '100vh',
    overflow: 'auto',
    placeContent: 'center',
    display: 'grid',
    background: 'linear-gradient(61.87deg, #090E22 32.6%, #26072B 94.75%)',
  },
});
  