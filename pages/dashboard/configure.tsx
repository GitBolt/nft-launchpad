import toast from 'react-hot-toast';
import React, {
  useEffect, useState,
} from 'react';
import { Sidebar } from '@/layouts/Sidebar';
import { DefaultHead } from '@/layouts/Head';
import type { NextPage } from 'next';
import {
  getRPC, connectWallet,
} from '@/components/wallet';
import type { Configurations } from '@/types/configurations';
import { PageRoot } from '@/layouts/StyledComponents';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { loadCandyProgramV2 } from '@/components/candymachine';
import { BN } from '@project-serum/anchor';
import { toDate } from '@/lib/utils';
import { Navbar } from '@/layouts/Navbar';
import { ConfigureConfigs } from '@/layouts/ConfigureConfigs';
import { DeployForm } from '@/layouts/DeployForm';
import { useRouter } from 'next/router';

const Index: NextPage = function Index() {

  const router = useRouter();

  const [isDeployed, setIsDeployed] = useState<boolean>(true);
  const [partiallyDeployed, setPartiallyDeployed] = useState<boolean>(false);
  const [assetsUploaded, setAssetsUploaded] = useState<boolean>(true);
  const [defaultNetwork, setDefaultNetwork] = useState<string>('devnet');
  const [deployForm, setDeployForm] = useState<boolean>(false);
  const [initializing, setInitialzing] = useState<boolean>(true);
  const [progressing, setProgressing] = useState<boolean>(false);
  const [dMint, setDynamicMint] = useState<boolean>(false);
  const [dConfigs, setDmConfigs] = useState<string>('');
  const [cm, setCandyMachine] = useState<string>('');
  const [project_id, setProjectId] = useState<number>(0);

  const [config, setConfig] = useState<Configurations>({
    itemsAvailable: 0,
    price: 0,
    solTreasuryAccount: '',
    splTreasuryAccount: '',
    splToken: '',
    splTokenAccount: '',
    royalty: 5,
    goLiveDate: null,
    endSettings: null,
    whitelistMintSettings: {
      mode: { burnEveryTime: false },
      mint: null,
      presale: true,
      discountPrice: 0,
    },
  });
  useEffect(() => {
    const projectId = router.query.project;
    if (!projectId) return;
    setProjectId(Number(projectId));
    const fetchData = async () => {
      const pubKey = await connectWallet(true, false);
      const statusRes = await fetch(`/api/candymachine/state/${projectId}`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const {
        deployed, candyMachine, itemCount, network, dynamicMint, dmConfigs,
      } = await statusRes.json();
      setCandyMachine(candyMachine);
      setDynamicMint(dynamicMint);
      setDmConfigs(dmConfigs);
      localStorage.setItem('cluster', network === 'mainnet'
        ? 'https://api.mainnet-beta.solana.com'
        : 'https://api.devnet.solana.com');
      if (network) setDefaultNetwork(network);

      if (!deployed) { setIsDeployed(false); }
      if (!itemCount) setAssetsUploaded(false);
      if (!deployed && !itemCount) return;
      if (!deployed && candyMachine) { setPartiallyDeployed(true); setDeployForm(true); }
      if (deployed) setIsDeployed(true);
      setConfig({
        ...config,
        itemsAvailable: itemCount,
      });

      const anchorProgram = await loadCandyProgramV2(
        pubKey,
        getRPC(),
      );

      if (!anchorProgram || !candyMachine) return;
      const candyMachineObj = await anchorProgram.account.candyMachine.fetch(
        new PublicKey(candyMachine),
      );
      const epoch = new BN(candyMachineObj.data.goLiveDate).toNumber();
      const goLiveDate = new Date(epoch * 1000);
      let { endSettings } = candyMachineObj.data;
      if (endSettings) {
        const type = Object.keys(endSettings.endSettingType)[0];
        if (type === 'date') {
          const endDate = toDate(endSettings.number);
          endSettings = { endSettingType: { date: true }, number: endDate };
        } else {
          const value = endSettings.number.toNumber();
          endSettings = { endSettingType: { amount: true }, number: value };
        }
      }
      const { whitelistMintSettings } = candyMachineObj.data;
      if (whitelistMintSettings && whitelistMintSettings.discountPrice) {
        whitelistMintSettings.discountPrice /= LAMPORTS_PER_SOL;
      }
      setConfig((prevConfig: Configurations) => ({
        ...prevConfig,
        price: candyMachineObj.data.price.toNumber() / LAMPORTS_PER_SOL,
        whitelistMintSettings,
        goLiveDate,
        solTreasuryAccount: candyMachineObj.wallet.toString(),
        endSettings,
      }));
    };
    setInitialzing(true);
    const promise = fetchData();
    toast.promise(promise, {
      loading: 'Initializing candy machine config',
      success: 'Successfully initialized configs',
      error: 'Error initializing configs, try reloading',
    }).then(() => setInitialzing(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.project]);
  return (
    <>
      <DefaultHead />
      <Navbar />
      <PageRoot>
        <div className="w-[100vw]">
          <Sidebar disabled={progressing} />
          <PageRoot style={{
            marginLeft: '20rem',
            placeContent: 'start',
            display: 'block',
          }}
          >
            {!assetsUploaded && <div className="bg-gray-200 h-full w-full fixed z-20 flex items-center mt-[6rem] z-10 opacity-[20%]" />}
            {!assetsUploaded && (
            <div className="bg-orange-400 h-8 w-full fixed z-20 flex items-center mt-[6rem]">
              <h1 className="text-white text-xl ml-6 text">No assets have been uploaded, so this page is disabled.</h1>
            </div>
            )}
            <div className="h-full relative mt-36 ml-[1.25rem]">
              <h1 className="text-3xl font-bold text-white">Configure</h1>
              <p className='text-gray-300'>Your candy machine ID: {cm}</p>
              {((!deployForm && !partiallyDeployed) || !deployForm) && (
              <ConfigureConfigs
                isDeployed={isDeployed}
                defaultNetwork={defaultNetwork}
                config={config}
                setConfig={setConfig}
                setDeployForm={setDeployForm}
                defaultMintEnd={config.endSettings?.endSettingType.date ? 'date' : 'amount'}
                defaultBurn={config.whitelistMintSettings?.mode.burnEveryTime || false}
                dynamicMint={dMint}
                dmConfigs={dConfigs}
                project_id={project_id}
              />
              )}
              {!((!deployForm && !partiallyDeployed) || !deployForm) && !initializing
              && (
              <DeployForm
                setProgressing={setProgressing}
                config={config}
                setConfig={setConfig}
                setDeployForm={setDeployForm}
                project_id={project_id}
              />
              )}
            </div>
          </PageRoot>
        </div>
      </PageRoot>

    </>
  );
};

export default Index;
