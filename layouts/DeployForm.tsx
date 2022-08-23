import React, { useState, useEffect } from 'react';
import { Button } from '@material-ui/core';
import {
  transferAuthority, deployCandyMachine, updateIndices, createTempWallet,
} from '@/util/handleDeploy';
import {
  connectWallet, getRPC, createNewToken, signNonce,
} from '@/components/wallet';
import type { Configurations } from '@/types/configurations';
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { loadCandyProgramV2, updateAuthorityRaw } from '@/components/candymachine';
import toast from 'react-hot-toast';
import { depositSOL } from '@/util/depositSOL';
import { postNetworkRequest } from '@/util/functions';
import * as web3 from '@solana/web3.js';
import Confirmed from '@/images/Confirmed.svg';
import Unconfirmed from '@/images/Unconfirmed.svg';
import Current from '@/images/Current.svg';
import Image from 'next/image';
import { useRouter } from 'next/router';

type Props = {
  setConfig: React.Dispatch<React.SetStateAction<Configurations>>,
  setDeployForm: React.Dispatch<React.SetStateAction<boolean>>,
  config: Configurations,
  setProgressing: React.Dispatch<React.SetStateAction<boolean>>
};

export const DeployForm = function DeployForm({
  config,
  setDeployForm,
  setConfig,
  setProgressing,
}: Props) {
  const [walletKeypair, setWalletKeypair] = useState<Keypair | null>(null);
  const [candy_machine, setCandyMachine] = useState<PublicKey>();
  const [step, setStep] = useState<number>(1);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [projectSlug, setProjectSlug] = useState<string | null>(null);
  const [initializing, setInitialzing] = useState<boolean>(true);
  const [loadingStep, setLoadingStep] = useState<number | null>(null);
  const router = useRouter();
  const project_id = router.query.project;
  const whitelistTokenCost = 0.01;
  const depAmount = ((config.itemsAvailable / 8) * 0.001) + whitelistTokenCost;
  // const requiredInMainWallet = ((config.itemsAvailable * 0.0016804)
  //                             + whitelistTokenCost
  //                             + depAmount);
  useEffect(() => {
    const init = async () => {
      setDepositAmount(depAmount);
      const publicKey = await connectWallet(true, false);
      const projectRes = await fetch(`/api/project/get/public_key/${publicKey.toString()}`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const { project } = await projectRes.json();
      setProjectSlug(project.slug);

      const localKeyPair = localStorage.getItem('tempKeyPair');
      let walletKp;
      if (localKeyPair) {
        const tempKeyPair = JSON.parse(localKeyPair);
        walletKp = Keypair.fromSecretKey(Uint8Array.from(tempKeyPair));
        setWalletKeypair(walletKp);
      }
      // key pair not made for depositing sol
      if (!walletKp) { return; }

      const connection = new web3.Connection(getRPC());
      const stateRes = await fetch(`/api/candymachine/state/${publicKey.toString()}`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const stateData = await stateRes.json();
      const balance = await connection.getBalance(walletKp.publicKey);
      if ((balance / LAMPORTS_PER_SOL) >= depAmount) {
        setStep(2);
      }
      if (getRPC() === 'https://api.mainnet-beta.solana.com' && stateData.network === 'devnet') {
        return;
      }

      if (stateData.whitelist_mint || config.whitelistMintSettings?.mint) {
        setStep(3);
        setConfig((prevState) => ({
          ...prevState,
          whitelistMintSettings: {
            discountPrice: config.whitelistMintSettings?.discountPrice || 0,
            mode: config.whitelistMintSettings?.mode || { burnEveryTime: false },
            mint: (stateData.whitelist_mint && new PublicKey(stateData.whitelist_mint))
              || config.whitelistMintSettings?.mint,
            presale: true,
          },
        }));
      }
      if (!stateData?.candyMachine) {
        return;
      }
      if (stateData?.candyMachine) {
        setCandyMachine(new PublicKey(stateData.candyMachine));
        setStep(4);
      }
      const anchorProgram = await loadCandyProgramV2(
        publicKey,
        getRPC(),
      );
      if (!anchorProgram) return;
      const candyMachine = new PublicKey(stateData?.candyMachine);
      const candyMachineObj: any = await anchorProgram.account.candyMachine.fetch(
        candyMachine,
      );
      const authorityPubKey = new PublicKey(candyMachineObj.authority);
      if (publicKey.toString() !== authorityPubKey.toString()) {
        setStep(5);
      }
    };
    setInitialzing(true);
    const promise = init();
    toast.promise(promise, {
      success: 'Sucessfully loaded',
      loading: 'Loading deployment configurations',
      error: 'Error loading configurations',
    }).then(() => setInitialzing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.itemsAvailable, depAmount]);
  return (
    <div
      className="flex flex-col relative gap-6 bg-[#02041a9c] rounded-2xl p-[2rem] w-[98%] mt-[1rem] mb-[2rem]"
      style={{
        boxShadow: '#480b39a3 0px 0px 20px',
      }}
    >

      <p className="text-[1.2rem] text-white">Step 2/2: Complete the following steps to deploy your collection on Candy Machine.</p>
      <div style={{
        width: '2px',
        height: '63%',
        background: '#BDBDBD',
        position: 'absolute',
        zIndex: '0',
        left: '3.1rem',
        top: '14%',
      }}
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-8 justify-between">
          <div className="w-[2.5rem] h-[2.5rem] shrink-0">
            <Image src={(step > 1 && Confirmed) || (step === 1 ? Current : Unconfirmed)} width="100%" height="100%" alt="Status" />
          </div>
          <div>
            <p className="text-[#054BD2] font-medium text-[1.2rem]">Deposit SOL</p>
            <p className="text-[#616161] w-[70%] text-[1rem]">Some SOL will be deducted from your wallet to complete the following steps.</p>
          </div>
        </div>
        {step === 1 && (
          <Button
            onClick={async () => {
              let walletKp = walletKeypair;
              if (!walletKeypair) {
                walletKp = await createTempWallet();
                setWalletKeypair(walletKp);
              }
              setProgressing(true);
              if (!walletKp) { return; }
              setLoadingStep(1);
              const promise = depositSOL(
                walletKp.publicKey,
                depositAmount,
                true,
              );
              toast.promise(promise, {
                loading: 'Depositing SOLs',
                success: 'Successfully deposited',
                error: (err) => err.toString(),
              }).then(() => {
                if (config.whitelistMintSettings) { setStep(2); } else { setStep(3); }
                setLoadingStep(null);
                setProgressing(false);
              }).catch(() => { setLoadingStep(null); setProgressing(false); });
            }}
            disabled={initializing || loadingStep === 1}
            size="large"
            style={{
              background: initializing || loadingStep === 1 ? '#5178C3' : '#054BD2',
              color: 'white',
              height: '2.5rem',
              width: '10rem',
            }}
          >
            Proceed
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-8">
          <div className="w-[2.5rem] h-[2.5rem] shrink-0">
            <Image src={(step > 2 && Confirmed) || (step < 2 ? Unconfirmed : Current)} width="100%" height="100%" alt="Status" />
          </div>
          <div>
            <p className="text-[#054BD2] font-medium text-[1.2rem]">Create Whitelist Token</p>
            <p className="text-[#616161] w-[70%] text-[1rem]">This step creates the whitelist token which will whitelist the wallet having it</p>
          </div>
        </div>
        {step === 2 && (
          <Button
            onClick={async () => {
              const whitelistsLen = localStorage.getItem('whitelistLen');
              if (!whitelistsLen || !walletKeypair) return;
              setLoadingStep(2);
              const toastId = toast.loading('Creating tokens');
              setProgressing(true);
              try {
                const mintAddress = await createNewToken(
                  walletKeypair,
                  JSON.parse(whitelistsLen),
                  toastId,
                );
                if (!mintAddress) return;
                // @ts-ignore (whitelistMintSettings will always have default on this render)
                setConfig((prevState) => ({
                  ...prevState,
                  whitelistMintSettings: {
                    ...prevState.whitelistMintSettings,
                    mint: new PublicKey(mintAddress),
                    presale: true,
                  },
                }));
                const public_key = await connectWallet(true, true);
                if (!public_key) return;
                const signature = await signNonce();
                if (!signature) return;
                const data = {
                  whitelist_mint: mintAddress,
                  public_key,
                  signature,
                };
                await postNetworkRequest(
                  data,
                  '/api/cache/update',
                  'Error updating cache, try again',
                  false,
                );
                setStep(3);
                toast.dismiss(toastId);
                setProgressing(false);
              } catch (e: any) {
                setLoadingStep(null);
                toast.error(e.toString(), { id: toastId });
                setProgressing(false);
              }
            }}
            disabled={step !== 2 || loadingStep === 2}
            size="large"
            style={{
              background: (step !== 2 || loadingStep === 2) ? '#5178C3' : '#054BD2',
              height: '2.5rem',
              color: 'white',
              width: '10rem',
            }}
          >
            Proceed

          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-8">
          <div className="w-[2.5rem] h-[2.5rem] shrink-0">
            <Image src={(step > 3 && Confirmed) || (step === 3 ? Current : Unconfirmed)} width="100%" height="100%" alt="Status" />
          </div>
          <div>
            <p className="text-[#054BD2] font-medium text-[1.2rem]">Deploy Candy Machine</p>
            <p className="text-[#616161] w-[70%] text-[1rem]">Deploy the candy machine with the configurations entered earlier</p>
          </div>
        </div>
        {step === 3 && (
          <Button
            onClick={async () => {
              setLoadingStep(3);
              setProgressing(true);
              const promise = deployCandyMachine(config);
              toast.promise(promise, {
                loading: 'Deploying candy machine',
                success: 'Successfully deployed',
                error: (err) => err.toString(),
              }).then((cmData) => {
                setCandyMachine(cmData!.candyMachine);
                setStep(4);
                setLoadingStep(null);
                setProgressing(false);
                console.log('Candy machine ID: ', cmData!.candyMachine?.toBase58());
                console.log('Candy machine UUID: ', cmData!.uuid);
                console.log('Candy machine config: ', cmData);
              }).catch(() => { setLoadingStep(null); setProgressing(false); });
            }}
            disabled={step !== 3 || loadingStep === 3}
            size="large"
            style={{
              background: (step !== 3 || loadingStep === 3) ? '#5178C3' : '#054BD2',
              height: '2.5rem',
              color: 'white',
              width: '10rem',
            }}
          >
            Proceed

          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-8">
          <div className="w-[2.5rem] h-[2.5rem] shrink-0">
            <Image src={(step > 4 && Confirmed) || (step === 4 ? Current : Unconfirmed)} width="100%" height="100%" alt="Status" />
          </div>
          <div>
            <p className="text-[#054BD2] font-medium text-[1.2rem]">Update Authority</p>
            <p className="text-[#616161] w-[70%] text-[1rem]">Update the candy machine authority for writing NFTs to candy machine</p>
          </div>
        </div>
        {step === 4 && (
          <Button
            onClick={async () => {
              setLoadingStep(4);
              setProgressing(true);
              const promise = transferAuthority(await connectWallet(true, true));
              toast.promise(promise, {
                loading: 'Updating authority',
                success: 'Sucessfully updated authority',
                error: (err) => err.toString(),
              }).then((kp) => {
                setWalletKeypair(kp);
                setStep(5);
                setLoadingStep(null);
                setProgressing(false);
              }).catch(() => { setLoadingStep(null); setProgressing(false); });
            }}
            disabled={step !== 4 || loadingStep === 4}
            size="large"
            style={{
              background: (step !== 4 || loadingStep === 4) ? '#5178C3' : '#054BD2',
              height: '2.5rem',
              color: 'white',
              width: '10rem',
            }}
          >
            Proceed

          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-8">
          <div className="w-[2.5rem] h-[2.5rem] shrink-0">
            <Image src={(step > 5 && Confirmed) || (step === 5 ? Current : Unconfirmed)} width="100%" height="100%" alt="Status" />
          </div>
          <div>
            <p className="text-[#054BD2] font-medium text-[1.2rem]">Write Indices</p>
            <p className="text-[#616161] w-[70%] text-[1rem]">
              Complete this final steps to write your NFTs to Candy Machine.
            </p>
          </div>
        </div>
        {step === 5 && (
          <Button
            onClick={async () => {
              if (!candy_machine) { return; }
              setLoadingStep(5);
              setProgressing(true);
              const promise = updateIndices(
                await connectWallet(true, true),
                walletKeypair!,
                new PublicKey(candy_machine),
                Number(project_id),
              );
              toast.promise(promise, {
                loading: 'Writing indices',
                success: 'Sucessfully wrote indices',
                error: (err) => err.toString(),
              }).then(() => {
                setStep(6);
                setLoadingStep(null);
                setProgressing(false);
              }).catch(async () => {
                const toastid = toast.loading('Transferring authority back');
                console.log('Updating authority back to original wallet...');
                await updateAuthorityRaw(
                  walletKeypair!,
                  await connectWallet(true, false),
                  await connectWallet(true, false),
                ).then(() => {
                  setLoadingStep(null);
                  toast.dismiss(toastid);
                  setProgressing(false);
                });
              });
            }}
            disabled={step !== 5 || loadingStep === 5}
            size="large"
            style={{
              background: (step !== 5 || loadingStep === 5) ? '#5178C3' : '#054BD2',
              height: '2.5rem',
              color: 'white',
              width: '10rem',
            }}
          >
            Proceed
          </Button>
        )}
      </div>
      <div className="flex justify-between">
        <Button
          variant="contained"
          style={{
            background: loadingStep || step === 6 ? '#5178C3' : '#054BD2',
            color: 'white',
            width: '48%',
            height: '2.8rem',
            borderRadius: '1rem',
          }}
          onClick={() => setDeployForm(false)}
          disabled={!!loadingStep || step === 6}
        >
          Go back
        </Button>
        <Button
          variant="contained"
          style={{
            background: step !== 6 ? '#5178C3' : '#054BD2',
            color: 'white',
            width: '48%',
            height: '2.8rem',
            borderRadius: '1rem',
          }}
          onClick={() => window.open(`/${projectSlug}`, '_blank')}
          disabled={step !== 6}
        >
          Go to mint site
        </Button>

      </div>
    </div>

  );
};
