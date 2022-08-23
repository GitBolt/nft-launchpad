import React, {
  useEffect, useMemo, useState, useCallback,
} from 'react';
import type { NextPage } from 'next';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  getCandyMachineState,
  mintOneToken,
} from '@/components/mintCandymachine';
import { toDate } from '@/lib/utils';
import * as anchor from '@project-serum/anchor';
import { MintCountdown } from '@/layouts/MintCountdown';
import { getCountdownDate, handleWhitelistUser } from '@/util/mintPageUtils';
import toast from 'react-hot-toast';
import { MintArea } from '@/layouts/MintArea';
import { WhitelistMintModal, WhitelistMintErrorModal } from '@/layouts/WhitelistMintModal';
import type { Project } from '@/types/projectData';
import { MintUpperSection, MintUpperSectionError } from '@/layouts/MintUpperSection';
import { ConnectWallet } from '@/layouts/Wallet';
import { DefaultHead } from '@/layouts/Head';
import { postNetworkRequest } from '@/util/functions';
import { FaqSection } from '@/layouts/FaqSection';
import { HeaderSection } from '@/layouts/HeaderSection';
import { Sections } from '@/layouts/Sections';
// import { DynamicPricingCM } from '@/layouts/DynamicMintCM';
import { useLivePrice } from '@/components/useLivePrice';


const ProjectMint: NextPage<Project> = function Index({ projectData, siteData, network, dynamicMintConfigs }: Project) {
  const [isUserMinting, setIsUserMinting] = useState(false);
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [isActive, setIsActive] = useState(false);
  const [endDate, setEndDate] = useState<Date>();
  const [itemsRemaining, setItemsRemaining] = useState<number>(0);
  const [isWhitelistUser, setIsWhitelistUser] = useState(false);
  const [isPresale, setIsPresale] = useState(false);
  const [discountPrice, setDiscountPrice] = useState<anchor.BN>();
  const [modalType, setModalType] = useState<string | null>(null);
  const [cmReloadCount, setCmReloadCount] = useState<number>(0);

  const rpcUrl = network === 'devnet' ? 'https://api.devnet.solana.com' : 'https://api.mainnet-beta.solana.com';
  const globalConnection = new anchor.web3.Connection(rpcUrl);

  const txTimeout = 30000;
  const wallet = useWallet();
  const livePrice = useLivePrice(dynamicMintConfigs.tokenBonding);
  const anchorWallet = useMemo(() => {
    if (
      !wallet
      || !wallet.publicKey
      || !wallet.signAllTransactions
      || !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  const refreshCandyMachineState = useCallback(async () => {
    if (!anchorWallet) {
      return;
    }
    const connection = new anchor.web3.Connection(rpcUrl);
    if (projectData.candymachine_id) {
      try {
        const cndy = await getCandyMachineState(
          anchorWallet,
          new anchor.web3.PublicKey(projectData.candymachine_id),
          connection,
        );
        setCandyMachine(cndy);
        console.log(cndy);
        let active = cndy?.state.goLiveDate?.toNumber() <= new Date().getTime() / 1000;
        const presale = true;
        // is there a discount?
        if (cndy.state.whitelistMintSettings.discountPrice) {
          setDiscountPrice(cndy.state.whitelistMintSettings.discountPrice);
        } else {
          setDiscountPrice(undefined);
          // when presale=false and discountPrice=null, mint is restricted
          // to whitelist users only
          if (!cndy.state.whitelistMintSettings.presale) {
            cndy.state.isWhitelistOnly = true;
          }
        }
        // datetime to stop the mint?
        if (cndy?.state.endSettings?.endSettingType.date) {
          setEndDate(toDate(cndy.state.endSettings.number));
          if (
            cndy.state.endSettings.number.toNumber()
            <= new Date().getTime() / 1000
          ) {
            active = false;
          }
        }
        // amount to stop the mint?
        if (cndy?.state.endSettings?.endSettingType.amount) {
          const limit = Math.min(
            cndy.state.endSettings.number.toNumber(),
            cndy.state.itemsAvailable,
          );
          if (cndy.state.itemsRedeemed < limit) {
            setItemsRemaining(limit - cndy.state.itemsRedeemed);
          } else {
            setItemsRemaining(0);
            cndy.state.isSoldOut = true;
          }
        } else {
          setItemsRemaining(cndy.state.itemsRemaining);
        }
        if (cndy.state.isSoldOut) {
          active = false;
        }

        setIsActive((cndy.state.isActive = active));
        setIsPresale((cndy.state.isPresale = presale));
      } catch (e) {
        console.log('There was a problem fetching Candy Machine state');
        console.log(e);
      }
    }
  }, [anchorWallet, projectData.candymachine_id, rpcUrl]);

  const onMint = async (
    beforeTransactions: Transaction[] = [],
    afterTransactions: Transaction[] = [],
  ) => {
    try {
      setIsUserMinting(true);
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        const mintOne = await mintOneToken(
          candyMachine,
          wallet.publicKey,
          beforeTransactions,
          afterTransactions,
        );
        const mintTxId = mintOne[0];
        console.log('Mint tx id', mintTxId);
        let status: any = { err: 'Signature confirmation timeout' };
        if (mintTxId) {
          status = await awaitTransactionSignatureConfirmation(
            mintTxId,
            txTimeout,
            globalConnection,
            true,
          );
        }
        console.log('Status ', status);
        if (status && !status.err) {
          const remaining = itemsRemaining - 1;
          console.log(remaining);
          setItemsRemaining(remaining);
          setIsActive((candyMachine.state.isActive = remaining > 0));
          candyMachine.state.isSoldOut = remaining === 0;
          candyMachine.state.itemsRemaining = remaining;
          setIsUserMinting(false);
          toast.success('Congratulations! Mint succeeded!');
          let price = candyMachine.state.price.toNumber() / LAMPORTS_PER_SOL;
          if (isWhitelistUser && discountPrice) {
            price = discountPrice.toNumber() / LAMPORTS_PER_SOL;
          }
          const data = {
            mint_signature: mintTxId,
            price,
            project_id: projectData.id,
            presale: !!isPresale,
          };
          await postNetworkRequest(
            data,
            '/api/analytics/sales/add',
          );
        } else {
          toast.error(status.err.toString() || 'Mint failed!');
        }
      }
    } catch (error: any) {
      const errormsg = 'Minting failed , try again';
      toast.error(error.toString() || errormsg);
    } finally {
      setIsUserMinting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleMintButton = () => {
    let active = !isActive || isPresale;

    if (active) {
      if (candyMachine!.state.isWhitelistOnly && !isWhitelistUser) {
        active = false;
      }
      if (endDate && Date.now() >= endDate.getTime()) {
        active = false;
      }
    }

    if (
      isPresale
      && candyMachine!.state.goLiveDate
      && candyMachine!.state.goLiveDate.toNumber() <= new Date().getTime() / 1000
    ) {
      setIsPresale((candyMachine!.state.isPresale = false));
    }

    setIsActive((candyMachine!.state.isActive = active));
  };

  useEffect(() => {
    setCmReloadCount(cmReloadCount + 1);
    const updateTraffic = async () => {
      if (cmReloadCount === 2) {
        const data = {
          project_id: projectData.id,
          presale: isPresale,
        };
        await postNetworkRequest(
          data,
          '/api/analytics/traffic/add',
        );
      }
    };

    updateTraffic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candyMachine]);

  useEffect(() => {
    refreshCandyMachineState();
  }, [
    anchorWallet,
    projectData.candymachine_id,
    refreshCandyMachineState,
  ]);
  if (projectData.error) {
    return (
      <>
        <DefaultHead title="Not found" />
        <Grid style={{
          height: '100vh',
          width: '100vw',
          background: 'white',
          margin: '0',
          display: 'flex',
          flexFlow: 'column',
          alignItems: 'center',
        }}
        >
          <MintUpperSectionError />
        </Grid>
      </>
    );
  }
  return (
    <>
      <DefaultHead title={`Mint | ${projectData.name}`} image={projectData.banner || ''} description={projectData.description} />
      <Grid style={{
        height: '100%',
        minHeight: '100vh',
        maxWidth: '100vw',
        background: siteData.bgColor,
        color: siteData.primaryFontColor,
        margin: '0',
        display: 'flex',
        flexFlow: 'column',
        alignItems: 'center',
      }}
      >
        {siteData.header && <HeaderSection header={siteData.header} />}
        <MintUpperSection
          projectData={projectData}
          candyMachine={candyMachine}
          siteData={siteData}
          itemsRemaining={itemsRemaining}
          headerSpace={!!siteData.header}
          livePrice={livePrice}
        />
        {candyMachine && (
          <div className="w-[42rem] flex items-center flex-col">
            {isActive && endDate && Date.now() < endDate.getTime() && (
              <MintCountdown
                key="endSettings"
                date={getCountdownDate(candyMachine)}
                onComplete={toggleMintButton}
                label="Ending in: "
              />
            )}

            {!isActive && candyMachine.state.goLiveDate
              && candyMachine.state.goLiveDate.toNumber() > new Date().getTime() / 1000
              && (
                <MintCountdown
                  key="goLive"
                  date={getCountdownDate(candyMachine)}
                  onComplete={toggleMintButton}
                  label="Launching in: "
                />
              )}
            {(!isActive
              && !candyMachine.state.isSoldOut
              && candyMachine.state.goLiveDate.toNumber() > new Date().getTime() / 1000) ? (
              <div className="w-full mt-8">
                <Button
                  color="primary"
                  variant="contained"
                  onClick={async () => {
                    await handleWhitelistUser(
                      candyMachine,
                      anchorWallet!.publicKey,
                      globalConnection,
                      setIsWhitelistUser,
                      setModalType,
                    );
                  }}
                  style={{
                    width: '100%',
                    height: '3.5rem',
                    backgroundImage: 'linear-gradient(120deg, #84C0FF , #5768FF)',
                    color: 'white',
                    borderRadius: '3rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    textTransform: 'none',
                  }}
                >
                  Check your Whitelist status
                </Button>
              </div>
              ) : null}
          </div>
        )}

        {!wallet.connected && (
          <div className="w-1/4"><ConnectWallet><button style={{
            background: siteData.buttonBgColor || 'black',
            color: siteData.buttonFontColor || 'white',
            borderRadius: '3rem',
            height: '3.5rem',
            width: '100%',
            marginTop: '2rem',
            transition: '0ms',
            marginBottom: '2rem',
            fontSize: '1rem',
            fontWeight: '600',
            textTransform: 'none',
          }}>
            Connect wallet</button></ConnectWallet></div>
        )}
        {modalType === 'success' && (
          <WhitelistMintModal
            discountPrice={(discountPrice && discountPrice.toNumber() / LAMPORTS_PER_SOL) || 0}
            candyMachine={candyMachine}
            setIsUserMinting={setIsUserMinting}
            rpcUrl={rpcUrl}
            isUserMinting={isUserMinting}
            onMint={onMint}
            isActive={isActive}
            isPresale={isPresale}
            setModalType={setModalType}
            siteData={siteData}
          />
        )}
        {modalType === 'error' && (
          <WhitelistMintErrorModal
            discordInvite={projectData.discord_invite}
            setModalType={setModalType}
          />
        )}
        {isActive && candyMachine && !candyMachine.state.isSoldOut
          && candyMachine.state.goLiveDate.toNumber() < new Date().getTime() / 1000
          && wallet.connected ? (
          <MintArea
            candyMachine={candyMachine}
            wallet={wallet}
            setIsUserMinting={setIsUserMinting}
            rpcUrl={rpcUrl}
            connection={globalConnection}
            isUserMinting={isUserMinting}
            onMint={onMint}
            isActive={isActive}
            isWhitelistUser={isWhitelistUser}
            isPresale={isPresale}
            siteData={siteData}
          />
          ) : <h1 className="text-3xl text-gray-200 font-bold">Mint not active</h1>}
        {(siteData.sections) && (
          <Sections
            sections={siteData.sections}
          />
        )}
        {(siteData.faqSection) && (
          <FaqSection
            faqData={siteData.faqSection}
            siteData={siteData}
          />
        )}
        {/* {candyMachine && candyMachine.state.tokenMint && <DynamicPricingCM candyMachine={candyMachine} tokenBonding={tokenBonding}/>} */}
      </Grid>
    </>
  );
};

export default ProjectMint;

export async function getServerSideProps(context: any) {
  const { project_slug } = context.params;
  const { API_URL } = process.env;
  const res = await fetch(`${API_URL}/api/project/get/${project_slug}`, {
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  const cacheRes = await fetch(`${API_URL}/api/cache/get/${project_slug}`, {
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  const { network, dmConfigs } = await cacheRes.json();
  const data = await res.json();
  if (!data.projectData) {
    return {
      props: {
        projectData: {
          error: data.error,
        },
      },
    };
  }
  const siteData = {
    ...data.siteData,
    faqSection: JSON.parse(data.siteData.faqSection),
    header: JSON.parse(data.siteData.header),
    sections: JSON.parse(data.siteData.sections),
  };
  const dynamicMintConfigs = JSON.parse(dmConfigs);
  return {
    props: {
      projectData: data.projectData,
      siteData,
      network,
      dynamicMintConfigs,
    },
  };
}
