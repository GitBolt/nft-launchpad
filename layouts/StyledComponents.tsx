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
    color: 'black',
  },
  '& fieldset': {
    color: 'black',
  },
  '& label.Mui-focused': {
    color: 'black',
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
    background: '#080B16',
    overflow: 'auto',
    placeContent: 'center',
    display: 'grid',
  },
});
  