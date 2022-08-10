import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Navbar } from '@/layouts/Navbar';
import { Text, PageRoot } from '@/layouts/StyledComponents';
import Button from '@material-ui/core/Button';
import { connectWallet, signNonce } from '@/components/wallet';
import toast from 'react-hot-toast';
import { postNetworkRequest } from '@/util/functions';
import getWallet from '@/components/whichWallet';

const SignIn = function SignIn() {
  const [newTwitterUsername, setNewTwitterUsername] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [updated, setUpdated] = useState<boolean>(false);
  const wallet = getWallet();

  const updateTwitterUsername = () => {
    setError(false);
    const update = async () => {
      const public_key = await connectWallet(true, true);
      if (!public_key) return;
      const signature = await signNonce();
      if (!signature) return;
      const data = {
        projectData: { twitter_username: newTwitterUsername },
        siteData: { null: 'null' },
        signature,
        public_key,
      };
      await postNetworkRequest(
        data,
        '/api/project/update?onlyProject=true',
        undefined,
        true,
      );
    };
    const promise = update();
    toast.promise(promise, {
      loading: 'Updating username',
      success: 'Successfully updated',
      error: (err) => err.toString(),
    }).then(() => setUpdated(true)).catch(() => setUpdated(false));
  };

  return (
    <>
      <Navbar wallet={wallet} />
      <PageRoot>
        <div className="flex flex-col gap-4 w-[45rem] items-center bg-white rounded-2xl p-5 border-gray-600 border-2">
          <h1 className="text-xl text-center text-red-600">
            The project&apos;s twitter username did not
            match with the authorized twitter account&apos;s username
          </h1>
          <p>Update your project&apos;s twitter username and signin in again</p>
          <Text
            onChange={(e) => setNewTwitterUsername(e.target.value)}
            defaultValue={newTwitterUsername || ''}
            label="New twitter username"
            error={!!error}
            helperText={error ? 'Invalid twitter username' : null}
            style={{ width: '100%' }}
          />
          <div className="w-92 flex flex-col gap-6">
            <Button
              variant="outlined"
              color="primary"
              disabled={updated}
              onClick={updateTwitterUsername}
            >
              Update twitter username
            </Button>
            <Button
              variant="contained"
              size="medium"
              color="primary"
              disabled={!updated}
              onClick={() => signIn('twitter')}
            >
              Authorise using Twitter

            </Button>
          </div>
        </div>
      </PageRoot>

    </>
  );
};

export default SignIn;
