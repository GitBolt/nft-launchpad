import React from 'react';
import { PageRoot } from '@/layouts/StyledComponents';
import Button from '@material-ui/core/Button';
import { generateNonce } from '@/lib/crypto';
import { connectWallet, getMessageToSign, signMessage } from '@/components/wallet';
import { postNetworkRequest } from '@/util/functions';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

interface Props {
  setToggleModal: React.Dispatch<React.SetStateAction<boolean>>
  wallet: any
}
export const RegisterUser = function UserCreationModal({
  setToggleModal,
  wallet,
}: Props) {
  const router = useRouter();

  const register = async () => {
    const public_key = await connectWallet(true, true);
    const check = await fetch(`/api/user/get/${public_key}`);
    if (check.ok) {
      router.push(`/new/${public_key}`);
      return;
    }
    const sendData = async () => {
      localStorage.clear();
      const nonce = generateNonce();
      const signature = await signMessage(getMessageToSign(nonce));
      const data = {
        public_key,
        nonce,
        signature,
      };
      await postNetworkRequest(
        data,
        '/api/user/new',
        undefined,
        true,
      );
    };
    const promise = sendData();
    toast.promise(promise, {
      loading: 'Registering',
      success: 'Successfully registered',
      error: (err) => err.toString(),
    }).catch((err) => {
      if (err.toString() === 'Error: User already exists') {
        toast('Redirecting...');
      }
    }).then(() => router.push(`/new/${public_key}`));
  };

  const disconnect = async () => {
    await wallet.disconnect();
    setToggleModal(false);
  };
  return (
    <PageRoot
      style={{
        position: 'absolute',
        width: '100vw',
        background: '#000000c5',
        zIndex: '10',
      }}
    >
      <div className="bg-[#1F2337] flex flex-col items-center rounded-2xl gap-8 py-8 px-16">
        <h1 className="text-[2rem] text-white">Welcome to No Code NFT Launchpad</h1>
        <p className="text-[1rem] text-[#A5AABC] w-96 text-center">
          You do not have any projects created. Create your NFT project now.
        </p>
        <div className="flex flex-col gap-4">
          <Button
            onClick={register}
            variant="contained"
            style={{
              borderRadius: '.5rem',
              padding: '.65rem 1rem',
              fontSize: '1rem',
              minWidth: '10rem',
              width: '15rem',
              background: '#054BD2',
              color: 'white',
            }}
          >
            Create project
          </Button>
          <Button
            onClick={disconnect}
            variant="outlined"
            style={{
              borderRadius: '.5rem',
              padding: '.65rem 1rem',
              fontSize: '1rem',
              minWidth: '10rem',
              width: '15rem',
              color: 'white',
            }}
          >
            Disconnect wallet
          </Button>
        </div>
      </div>
    </PageRoot>
  );
};
