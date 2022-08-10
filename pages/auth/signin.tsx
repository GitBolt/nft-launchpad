import React from 'react';
import { signIn } from 'next-auth/react';
import { Navbar } from '@/layouts/Navbar';
import { PageRoot } from '@/layouts/StyledComponents';
import Button from '@material-ui/core/Button';
import getWallet from '@/components/whichWallet';

const SignIn = function SignIn() {
  return (
    <>
      <Navbar wallet={getWallet()} />
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
