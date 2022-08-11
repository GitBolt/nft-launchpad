import React from 'react';
import * as anchor from '@project-serum/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';
import { GatewayProvider } from '@civic/solana-gateway-react';
import {
  CandyMachineAccount,
  CANDY_MACHINE_PROGRAM,
} from '@/components/mintCandymachine';
import { sendTransaction } from '@/components/connection';
import { MintButton } from '@/layouts/MintButton';
import toast from 'react-hot-toast';
import { SiteData } from '@/types/projectData';

type Props = {
  candyMachine: CandyMachineAccount | undefined,
  wallet: any,
  setIsUserMinting: React.Dispatch<React.SetStateAction<boolean>>,
  rpcUrl: string,
  connection: anchor.web3.Connection | undefined,
  isUserMinting: boolean,
  onMint: any,
  isActive: boolean,
  isWhitelistUser: boolean,
  isPresale: boolean,
  siteData: SiteData
};
export const MintArea = function MintArea({
  candyMachine,
  wallet,
  setIsUserMinting,
  rpcUrl,
  connection,
  isUserMinting,
  onMint,
  isActive,
  isWhitelistUser,
  isPresale,
  siteData,
}: Props) {
  return (
    <div className="w-[42rem]">
      {candyMachine?.state.isActive
        && candyMachine?.state.gatekeeper
        && candyMachine.state.whitelistMintSettings
        && wallet.publicKey
        && wallet.signTransaction ? (
          <GatewayProvider
            wallet={{
              publicKey:
              wallet.publicKey
              || new PublicKey(CANDY_MACHINE_PROGRAM),
              // @ts-ignore
              signTransaction: wallet.signTransaction,
            }}
            gatekeeperNetwork={
            candyMachine?.state?.gatekeeper?.gatekeeperNetwork
          }
            clusterUrl={rpcUrl}
            handleTransaction={async (transaction: Transaction) => {
              setIsUserMinting(true);
              const userMustSign = transaction.signatures.find(
                (sig) => sig.publicKey.equals(wallet.publicKey!),
              );
              if (userMustSign) {
                toast('Please sign one-time Civic Pass issuance');
                try {
                // eslint-disable-next-line no-param-reassign
                  transaction = await wallet.signTransaction!(
                    transaction,
                  );
                } catch (e) {
                  toast.error('User cancelled signing');
                  // setTimeout(() => window.location.reload(), 2000);
                  setIsUserMinting(false);
                  throw e;
                }
              } else {
                toast('Refreshing Civic Pass');
                try {
                  await sendTransaction(
                    connection!,
                    wallet,
                    transaction,
                    [],
                    true,
                    'confirmed',
                  );
                  toast('Please sign minting');
                } catch (e) {
                  toast.error('Solana dropped the transaction, please try again');
                  console.error(e);
                  setIsUserMinting(false);
                  throw e;
                }
                await onMint();
              }
            }}
            broadcastTransaction={false}
            options={{ autoShowModal: false }}
          >
            <MintButton
              candyMachine={candyMachine}
              isMinting={isUserMinting}
              setIsMinting={(val: any) => setIsUserMinting(val)}
              onMint={onMint}
              isActive={isActive || (isPresale && isWhitelistUser)}
              rpcUrl={rpcUrl}
              siteData={siteData}
            />
          </GatewayProvider>
        ) : (
          <MintButton
            candyMachine={candyMachine}
            isMinting={isUserMinting}
            setIsMinting={(val: any) => setIsUserMinting(val)}
            onMint={onMint}
            isActive={isActive || (isPresale && isWhitelistUser)}
            rpcUrl={rpcUrl}
            siteData={siteData}
          />
        )}
    </div>
  );
};
