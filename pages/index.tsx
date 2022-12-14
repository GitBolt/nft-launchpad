import React, { useState } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import { connectWallet } from '@/components/wallet';
import { DefaultHead } from '@/layouts/Head';
import { PageRoot } from '@/layouts/StyledComponents';
import { Navbar } from '@/layouts/Navbar';
import Image from 'next/image';
import Button from '@material-ui/core/Button';
import { RegisterUser } from '@/layouts/RegisterUser';
import Landing from '@/images/Landing.svg';
import { useWallet } from '@solana/wallet-adapter-react';

const Index: NextPage = function Index() {
  const [showModal, setToggleModal] = useState<boolean>(false);

  const router = useRouter();
  const { connected } = useWallet();

  const handleClick = async () => {
    const public_key = await connectWallet(false, true);
    const res = await fetch(`/api/project/get/public_key/${public_key}?all=true`);
    if (res.ok) {
      router.push('/dashboard');
      return;
    }
    if (res.status === 400) {
      setToggleModal(true);
      return;
    }
    router.push('/auth/signin');
  };
  return (
    <>
      <Navbar />
      <DefaultHead />
      {showModal && (
      <RegisterUser
        setToggleModal={setToggleModal}
      />
      )}
      <PageRoot style={{ padding: '0 1.5rem' }}>
        <div className="flex items-center justify-center gap-6">
          <div className="min-w-[25rem] flex flex-col items-start gap-8 w-1/3">
            <h1 className="text-5xl text-white font-bold">NFT Launchpad</h1>
            <p className="text-xl text-[#A5AABC]">
              Launch NFTs seamlessly and easily through our no code NFT launchpad
            </p>
            <Button
              variant="contained"
              style={{
                borderRadius: '2rem',
                padding: '.65rem 2rem',
                fontSize: '1rem',
                minWidth: '20rem',
                background: 'linear-gradient(270deg, #A526C5 0%, #5022B1 101.88%);',
                color: 'white',
              }}
              onClick={handleClick}
            >
              {connected ? 'Go to dashboard' : 'Connect wallet'}
              {' '}
            </Button>
          </div>
          <Image src={Landing} height="500" width="500" alt="Landing image" />
        </div>
      </PageRoot>
    </>
  );
};

export default Index;