import React from 'react';
import { signIn } from 'next-auth/react';
import { Navbar } from '@/layouts/Navbar';
import { PageRoot } from '@/layouts/StyledComponents';
import Button from '@material-ui/core/Button';

const SignIn = function SignIn() {
  return (
    <>
      <Navbar />
      <PageRoot>
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={() => signIn('twitter')}
        >
          Authorise using Twitter

        </Button>
      </PageRoot>

    </>
  );
};

export default SignIn;
