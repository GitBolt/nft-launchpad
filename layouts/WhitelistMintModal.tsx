import React from 'react';
import { PageRoot } from '@/layouts/StyledComponents';
import { CandyMachineAccount } from '@/components/mintCandymachine';
import { MintButton } from '@/layouts/MintButton';
import { SiteData } from '@/types/projectData';
import Button from '@material-ui/core/Button';
import Image from 'next/image';
import Whitelisted from '@/images/Whitelisted.svg';
import NotWhitelisted from '@/images/NotWhitelisted.svg';

type Props = {
  discountPrice: number
  candyMachine: CandyMachineAccount | undefined,
  isUserMinting: boolean,
  setIsUserMinting: React.Dispatch<React.SetStateAction<boolean>>,
  onMint: any,
  isActive: boolean,
  rpcUrl: string,
  isPresale: boolean,
  setModalType: React.Dispatch<React.SetStateAction<string | null>>
  siteData: SiteData
};

export const WhitelistMintModal = function WhitelistMintModal({
  discountPrice,
  candyMachine,
  isUserMinting,
  setIsUserMinting,
  onMint,
  isActive,
  rpcUrl,
  isPresale,
  setModalType,
  siteData,
}: Props) {
  return (
    <PageRoot
      style={{
        position: 'fixed',
        width: '100%',
        height: '100%',
        background: '#000000c5',
        zIndex: '20',
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          setModalType(null);
        }
      }}
    >
      <div className="w-[35rem] h-[20rem] bg-white rounded-2xl flex items-center flex-col justify-center px-4 gap-4">
        <Image src={Whitelisted} alt="Whitelisted"/>
        <p className="text-gray-300 text-xl text-center w-[80%] my-5">
          You are whitelisted! Mint for
          {' '}
          {discountPrice}
          {' '}
          SOL
        </p>
        <div className="flex gap-4 w-full justify-center">
          <Button
            onClick={() => {
              setModalType(null);
            }}
            style={{
              width: '40%',
              height: '2.5rem',
              boxShadow: '0px 2px 6px #969696',
            }}
          >
            Discard
          </Button>
          <MintButton
            candyMachine={candyMachine}
            isMinting={isUserMinting}
            setIsMinting={(val: any) => setIsUserMinting(val)}
            onMint={onMint}
            isActive={isActive || isPresale}
            rpcUrl={rpcUrl}
            siteData={siteData}
            style={{
              background: '#00A81B',
              color: 'white',
              width: '40%',
              height: '2.5rem',
            }}
          />
        </div>
      </div>
    </PageRoot>
  );
};

type ErrorProps = {
  setModalType: React.Dispatch<React.SetStateAction<string | null>>,
  discordInvite: string | null,
};
export const WhitelistMintErrorModal = function WhitelistMintErrorModal({
  setModalType,
  discordInvite,
}: ErrorProps) {
  return (
    <PageRoot
      style={{
        position: 'fixed',
        width: '100%',
        height: '100%',
        background: '#000000c5',
        zIndex: '20',
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          setModalType(null);
        }
      }}
    >
      <div className="w-[35rem] h-[20rem] bg-white rounded-2xl flex items-center flex-col justify-center px-4 gap-4">
        <Image src={NotWhitelisted} alt="Not whitelisted"/>
        <p className="text-gray-300 text-xl text-center w-[80%] my-5">
          You are not whitelisted
        </p>
        <div className="flex gap-4 w-full justify-center">
          <Button
            onClick={() => {
              setModalType(null);
            }}
            style={{
              width: '40%',
              height: '2.5rem',
              boxShadow: '0px 2px 6px #969696',
            }}
          >
            Discard
          </Button>
          {discordInvite && (
          <Button
            onClick={() => window.open(discordInvite, '_blank')}
            style={{
              width: '40%',
              height: '2.5rem',
              boxShadow: '0px 2px 6px #969696',
            }}
          >
            Join discord
          </Button>
          )}
        </div>
      </div>
    </PageRoot>
  );
};
