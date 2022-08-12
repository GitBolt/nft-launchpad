import {
  TextField,
  Grid,
} from '@mui/material';
  
import { styled } from '@mui/material/styles';
  
export const Text = styled(TextField)({
  label: {
    color: '#343d60',
  },
  input: {
    color: 'white',
  },
  '& fieldset': {
    color: '#343d60',
  },
  '& label.Mui-focused': {
    color: '#343d60',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: '#343d60',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#343d60',
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
  