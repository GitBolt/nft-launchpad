// Component imports
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { Text } from '@/layouts/StyledComponents';
import { Configurations, DynamicMintConfig } from '@/types/configurations';
import { PublicKey } from '@solana/web3.js';
import { updateCandyMachine } from '@/components/candymachine';
import { createLiquidityBootstrapper } from '@/components/dynamicmint';
import toast from 'react-hot-toast';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { DynamicMint } from './DynamicMint';
import { connectWallet } from '@/components/wallet';
import { useWallet } from '@solana/wallet-adapter-react';
import { Wallet } from '@project-serum/anchor';
import { postNetworkRequest } from '@/util/functions';
import { signNonce } from '@/components/wallet';

// Image imports
import Save from '@material-ui/icons/Save';
import TreasuryAccount from '@/images/TreasuryAccount.svg';
import InputAdornment from '@mui/material/InputAdornment';
import Image from 'next/image';
import Settings from '@/images/Settings.svg';
import WhitelistSection from '@/images/WhitelistSection.svg';
import Presale from '@/images/Presale.svg';
import BurnMode from '@/images/BurnMode.svg';
import Solana from '@/images/Solana.svg';
import FormatListBulleted from '@material-ui/icons/FormatListBulleted';

// Picker imports
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';


type Props = {
  isDeployed: boolean
  defaultNetwork: string
  config: Configurations
  setConfig: React.Dispatch<React.SetStateAction<Configurations>>
  setDeployForm: React.Dispatch<React.SetStateAction<boolean>>
  defaultMintEnd: string
  defaultBurn: boolean
  dynamicMint: boolean
  dmConfigs: string
  project_id: number
};

interface Errors {
  solAccountError: string | null,
  priceError: string | null,
  royaltyError: string | null,
  dateError: string | null,
  amountNullError: string | null
  endDateError: string | null
  wlAmountNullError: string | null
  wlPriceNullError: string | null
}



export const ConfigureConfigs = function ConfigureConfigs({
  isDeployed,
  defaultNetwork,
  config,
  setConfig,
  setDeployForm,
  defaultMintEnd,
  defaultBurn,
  dynamicMint,
  dmConfigs,
  project_id,
}: Props) {

  const { connected, signAllTransactions, signTransaction, publicKey } = useWallet();
  const [network, setNetwork] = useState<string>(defaultNetwork);
  const [mintEndType, setMintEndType] = useState<string | null>(defaultMintEnd);
  const [burn, setBurn] = useState<boolean>(defaultBurn);
  const [showDynamicMint, setShowDynamicMint] = useState<boolean>(dynamicMint);
  const [dynamicMintConfig, setDynamicMintConfig] = useState<DynamicMintConfig | null>(dmConfigs ? JSON.parse(dmConfigs) : null);
  const [error, setError] = useState<Errors>({
    priceError: null,
    royaltyError: null,
    solAccountError: null,
    dateError: null,
    amountNullError: null,
    endDateError: null,
    wlAmountNullError: null,
    wlPriceNullError: null,
  });
  const handleNetwork = (networkName: string) => {
    if (networkName === 'devnet') {
      localStorage.setItem('cluster', 'https://api.devnet.solana.com');
      setNetwork('devnet');
    }
    if (networkName === 'mainnet') {
      localStorage.setItem('cluster', 'https://api.mainnet-beta.solana.com');
      setNetwork('mainnet');
    }
  };
  useEffect(() => {
    setShowDynamicMint(dynamicMint);
    if (dmConfigs) {
      setDynamicMintConfig(JSON.parse(dmConfigs));
    }
  }, [dynamicMint, dmConfigs]);
  const handleSubmit = () => {
    setError({
      solAccountError: null,
      royaltyError: null,
      priceError: null,
      dateError: null,
      amountNullError: null,
      endDateError: null,
      wlAmountNullError: null,
      wlPriceNullError: null,
    });
    let solAcc: PublicKey | null = null;
    let priceValid: boolean = true;
    let royaltyValid: boolean = true;
    let dateValid: boolean = true;
    let endSettingsValid: boolean = true;
    let wlAmountValid: boolean = true;
    let wlPriceValid: boolean = true;
    if (!config.price || Number.isNaN(config.price) || (config.price > 0 === false)) {
      setError((prevState) => ({ ...prevState, priceError: 'Price must be positive number' }));
      priceValid = false;
    }
    if (!config.royalty || Number.isNaN(config.royalty) || (config.royalty > 0 === false)) {
      setError((prevState) => ({ ...prevState, royaltyError: 'Royalty must be positive number' }));
      royaltyValid = false;
    }
    if (!config.goLiveDate) {
      setError((prevState) => ({ ...prevState, dateError: 'Go live date must be set' }));
      dateValid = false;
    }
    try {
      solAcc = new PublicKey(config.solTreasuryAccount);
    } catch {
      setError((prevState) => ({ ...prevState, solAccountError: 'Invalid SOL treasury account' }));
    }
    if (mintEndType === 'amount' && !config.endSettings?.endSettingType.amount) {
      setError((prevState) => ({ ...prevState, amountNullError: 'You must enter mint end type values' }));
      endSettingsValid = false;
    }
    if (mintEndType === 'date' && !config.endSettings?.endSettingType.date) {
      setError((prevState) => ({ ...prevState, endDateError: 'You must enter end date' }));
      endSettingsValid = false;
    }
    if (config.endSettings?.endSettingType.date
      && config.goLiveDate && config.endSettings.number
      && config.endSettings.number < +config.goLiveDate) {
      setError((prevState) => ({ ...prevState, endDateError: 'End date must be greater than go live date' }));
      endSettingsValid = false;
    }
    if (!isDeployed && !localStorage.getItem('whitelistLen')) {
      setError((prevState) => ({ ...prevState, wlAmountNullError: 'You need to enter whitelist amount' }));
      wlAmountValid = false;
    }

    if (config.whitelistMintSettings && !config.whitelistMintSettings.discountPrice) {
      setError((prevState) => ({ ...prevState, wlPriceNullError: 'You need to enter whitelist amount' }));
      wlPriceValid = false;
    }
    setConfig({
      ...config,
      price: Number(config.price),
      royalty: Number(config.royalty),
      whitelistMintSettings: {
        mode: config.whitelistMintSettings!.mode,
        presale: config.whitelistMintSettings!.presale,
        mint: config.whitelistMintSettings!.mint,
        discountPrice: Number(config.whitelistMintSettings?.discountPrice),
      },
    });
    if (!priceValid || !dateValid || !solAcc || !endSettingsValid
      || !wlPriceValid || !wlAmountValid || !royaltyValid) {
      window.scrollTo(0, 100);
      return;
    }
    if (!(isDeployed && network === defaultNetwork)) {
      setDeployForm(true);
    } else {

      const addDynamicPriceMint = async () => {
        if (showDynamicMint) {
          if (!connected || !publicKey || !signAllTransactions || !signTransaction) {
            throw new Error('Wallet error, try re-connecting');
          }
          const res = await createLiquidityBootstrapper({
            publicKey: publicKey,
            signAllTransactions: signAllTransactions,
            signTransaction: signTransaction,
          } as Wallet,
          await connectWallet(true, false),
          dynamicMintConfig as DynamicMintConfig,
          );
          // @ts-ignore
          setDynamicMintConfig({
            ...dynamicMintConfig,
            tokenBonding: res.tokenBonding.toBase58(),
            targetMint: res.targetMint.toBase58(),
            graveyardAta: res.graveyardAta.toBase58(),
          });
          return res;
        }
      };
      let promise;
      if (!dynamicMintConfig) {
        promise = updateCandyMachine(project_id, config);
      } else {
        let graveyardAcc: PublicKey | null = null;
        let graveyardToken: PublicKey | null = null;
        promise = addDynamicPriceMint().then((result) => {
          graveyardAcc = result?.graveyardAta || null;
          graveyardToken = result?.targetMint || null;
          if (!graveyardAcc || !graveyardToken) {
            throw new Error('An error occured, try updating again');
          }

        })
          .then(() => updateCandyMachine(project_id, { ...config, splToken: graveyardToken, splTokenAccount: graveyardAcc, price: 1 }, graveyardAcc, graveyardToken))
          .then(async () => {
            const public_key = await connectWallet(true, true);
            if (!public_key) return;
            const signature = await signNonce();
            if (!signature) return;
            await postNetworkRequest({
              public_key,
              signature,
              dynamicMint: true,
              dmConfigs: JSON.stringify(dynamicMintConfig),
              project_id,
            }, '/api/cache/update');
          });
      }
      toast.promise(promise, {
        success: 'Successfully updated candy machine',
        loading: 'Updating candy machine',
        error: (err) => err.toString(),
      }, { id: 'no-dup' });
    }
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="flex flex-col gap-6">
        <div className="flex gap-6 mt-8">
          <Button
            style={{
              width: '48%',
              border: `1px solid ${network === 'devnet' ? '#383F68' : '#15151F'}`,
              height: '2.5rem',
              background: network === 'devnet' ? '#1C1C2C' : 'transparent',
            }}
            disabled={defaultNetwork === 'mainnet'}
            onClick={() => handleNetwork('devnet')}
          >
            Devnet
          </Button>
          <Button
            style={{
              width: '48%',
              border: `1px solid ${network === 'mainnet' ? '#383F68' : '#15151F'}`,
              height: '2.5rem',
              background: network === 'mainnet' ? '#1C1C2C' : 'transparent',
            }}
            onClick={() => handleNetwork('mainnet')}
          >
            Mainnet
          </Button>
        </div>
        {network === 'mainnet' && (<div className="p-3 bg-[#1C1C2C] rounded-xl"><h1 className="text-gray-200">This is a permanent action and deploying on mainnet will use actual funds from your wallet. Do make sure to test on devnet first and then deploy on mainnet.</h1></div>)}
        <div className="flex items-center gap-3">
          <Image src={Settings} alt="Settings" />
          <h1 className="text-white text-2xl">Step 1/2: Project and mint settings</h1>
        </div>
        {!showDynamicMint && <Text
          variant="outlined"
          style={{ width: '70%' }}
          onChange={(e) => {
            setConfig({
              ...config,
              // @ts-ignore (converting to number before moving further in submit func)
              price: e.target.value,
            });
          }}
          label="Set Mint Price (SOL)"
          defaultValue={isDeployed && config.price}
          value={config.price || ''}
          error={!!(error?.priceError)}
          helperText={error && error.priceError ? error.priceError : null}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Image src={Solana} alt="Solana" />
              </InputAdornment>
            ),
          }}
        />}
        <Text
          variant="outlined"
          style={{ width: '70%' }}
          onChange={(e) => setConfig({
            ...config,
            solTreasuryAccount: e.target.value,
          })}
          value={config.solTreasuryAccount || ''}
          label="SOL treasury account"
          defaultValue={config.solTreasuryAccount || ''}
          error={!!error?.solAccountError}
          helperText={(error && error.solAccountError) ? error.solAccountError : null}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Image src={TreasuryAccount} alt="Acc" />
              </InputAdornment>
            ),
          }}
        />
        <DateTimePicker
          label="Go-live Date"
          onChange={(e: any) => {
            if (!e) return;
            setConfig({
              ...config,
              goLiveDate: e ? new Date(e) : null,
            });
          }}
          value={error.dateError && !config.goLiveDate ? '' : config.goLiveDate}
          renderInput={(params: any) => (
            <Text
              {...params}
              helperText={
                ((error && error.dateError) || !config.goLiveDate)
                  ? error.dateError : null
              }
              sx={{ width: '70%' }}
            />
          )}
        />
        <Text
          variant="outlined"
          style={{ width: '70%' }}
          onChange={(e) => setConfig({
            ...config,
            // @ts-ignore
            royalty: e.target.value,
          })}
          value={config.royalty || ''}
          label="Royalty percentage for creators"
          defaultValue={config.royalty || ''}
          error={!!error?.royaltyError}
          helperText={(error && error.royaltyError) ? error.royaltyError : null}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Image src={TreasuryAccount} alt="Acc" />
              </InputAdornment>
            ),
          }}
        />
        <div>
          <h1 className="text-gray-200">Mint-End condition</h1>
          <div className="flex gap-6">
            <div
              className="cursor-pointer w-[34%] h-56 rounded-2xl p-4 flex flex-col justify-between"
              onClick={() => { setMintEndType('amount'); setError({ ...error, endDateError: null }); }}
              style={{
                border: error.amountNullError && mintEndType === 'amount' ? '1px solid red' : '1px solid #343d60',
                boxShadow: mintEndType === 'amount' ? '1px 1px 10px black' : 'none',
              }}
            >
              <div className="relative flex flex-col">
                <div className="flex items-center gap-4">
                  <div
                    className="rounded-full w-5 h-5 border-blue-700 border-2 flex items-center justify-center"
                    style={{
                      border: mintEndType === 'amount' ? '2px solid #054BD2' : '2px solid #8F8F8F',
                    }}
                  >
                    <div
                      className="w-[.7rem] h-[.7rem] rounded-full"
                      style={{
                        background: mintEndType === 'amount' ? '#054BD2' : 'transparent',
                      }}
                    />
                  </div>
                  <h1 className='text-white'>End on reaching a amount</h1>
                </div>
                <div className="flex items-center gap-3 w-full mt-6">
                  <div className="w-full flex gap-4 items-center justify-center">
                    <Text
                      variant="outlined"
                      style={{ width: '50%' }}
                      value={config?.endSettings && config.endSettings.endSettingType.amount
                        ? config.endSettings.number : null}
                      onChange={(e) => {
                        if (!e) return;
                        setConfig({
                          ...config,
                          endSettings: {
                            endSettingType: { amount: true },
                            number: e.target.value ? Number(e.target.value) : null,
                          },
                        });
                      }}
                    />
                    {' '}
                    <p className="text-gray-200">NFTs</p>
                  </div>
                </div>
              </div>
              <p className="text-[#9A9A9A] text-center">The mint will end when the given number of NFTs have been minted.</p>
            </div>
            <div
              className="cursor-pointer border-[1px] border-gray-600 w-[34%] h-56 rounded-2xl p-4 flex flex-col justify-between"
              onClick={() => { setMintEndType('date'); setError({ ...error, amountNullError: null }); }}
              style={{
                border: error.endDateError && mintEndType === 'date' ? '1px solid red' : '1px solid #343d60',
                boxShadow: mintEndType === 'date' ? '1px 1px 10px black' : 'none',
              }}
            >
              <div className="relative flex flex-col">
                <div className="flex items-center gap-4">
                  <div
                    className="rounded-full w-5 h-5 border-blue-700 border-2 flex items-center justify-center"
                    style={{
                      border: mintEndType === 'date' ? '2px solid #343d60' : '2px solid #8F8F8F',
                    }}
                  >
                    <div
                      className="w-[.7rem] h-[.7rem] rounded-full"
                      style={{
                        background: mintEndType === 'date' ? '#054BD2' : 'transparent',
                      }}
                    />
                  </div>
                  {' '}
                  <h1 className='text-white'>End on reaching a date</h1>
                </div>
                <DateTimePicker
                  label="End mint date"
                  onChange={(e: any) => {
                    if (!e) return;
                    setConfig({
                      ...config,
                      endSettings: {
                        endSettingType: { date: true },
                        // @ts-ignore
                        number: new Date(e),
                      },
                    });
                  }}
                  value={config?.endSettings && config.endSettings.endSettingType.date
                    ? config.endSettings.number : null}
                  renderInput={(params: any) => (
                    <Text
                      {...params}
                      sx={{ width: '100%', marginTop: '1.5rem' }}
                    />
                  )}
                />
              </div>
              <p className="text-[#9A9A9A] text-center">The mint will end at the time defined here.</p>
            </div>
          </div>
          <p className="text-center w-[105%] text-red-500">{error.endDateError}</p>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Image src={WhitelistSection} alt="Whitelist" />
            <h1 className="text-gray-200 text-2xl">Whitelist settings</h1>
          </div>
          {(!isDeployed
            || (isDeployed && !config.whitelistMintSettings?.mint)) && (
              <Text
                label="Number of whitelist tokens to mint"
                style={{ width: '34%' }}
                placeholder="One token will WL for one mint"
                onChange={(e) => {
                  if (Number.isNaN(Number(e.target.value)) || Number(e.target.value) === 0) {
                    localStorage.removeItem('whitelistLen');
                  } else {
                    localStorage.setItem('whitelistLen', JSON.stringify(Number(e.target.value)));
                  }
                }}
                helperText={error && error.wlAmountNullError}
                error={!!(error && error.wlAmountNullError)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FormatListBulleted />
                    </InputAdornment>
                  ),
                }}
              />
          )}
          <Text
            label="Pre-sale Mint-price"
            style={{ width: '34%' }}
            value={config.whitelistMintSettings?.discountPrice || ''}
            defaultValue={config.whitelistMintSettings?.discountPrice || ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Image src={Presale} alt="Presale" />
                </InputAdornment>
              ),
            }}
            helperText={error && error.wlPriceNullError}
            error={!!(error && error.wlPriceNullError)}
            onChange={(e) => {
              setConfig({
                ...config,
                whitelistMintSettings: {
                  mode: config.whitelistMintSettings?.mode || { burnEveryTime: false },
                  mint: config.whitelistMintSettings?.mint || null,
                  presale: true,
                  // @ts-ignore (converting to number before moving further)
                  discountPrice: e.target.value,
                },
              });
            }}
          />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-gray-200">Burn mode for whitelist users</h1>
            </div>
            <div>
              <div className="flex gap-6">
                <div
                  className="cursor-pointer w-[34%] h-44 rounded-2xl p-4 flex flex-col"
                  onClick={() => {
                    setBurn(false);
                    setConfig({
                      ...config,
                      whitelistMintSettings: {
                        mode: { burnEveryTime: false },
                        mint: config.whitelistMintSettings?.mint || null,
                        presale: true,
                        discountPrice: config.whitelistMintSettings?.discountPrice || null,
                      },
                    });
                  }}
                  style={{
                    border: '1px solid #343d60',
                    boxShadow: !burn ? '1px 1px 10px black' : 'none',
                  }}
                >
                  <div className="relative flex flex-col">
                    <div className="flex items-center gap-4">
                      <div
                        className="rounded-full w-5 h-5 border-blue-700 border-2 flex items-center justify-center"
                        style={{
                          border: !burn ? '2px solid #054BD2' : '2px solid #8F8F8F',
                        }}
                      >
                        <div
                          className="w-[.7rem] h-[.7rem] rounded-full"
                          style={{
                            background: !burn ? '#054BD2' : 'transparent',
                          }}
                        />
                      </div>
                      <h1 className='text-gray-200'>Never burn</h1>
                    </div>
                  </div>
                  <p className="text-gray-200 text-center mt-[3rem]">Whitelist token is returned to holder</p>
                </div>
                <div
                  className="cursor-pointer w-[34%] h-44 rounded-2xl p-4 flex flex-col"
                  onClick={() => {
                    setBurn(true);
                    setConfig({
                      ...config,
                      whitelistMintSettings: {
                        mode: { burnEveryTime: true },
                        mint: config.whitelistMintSettings?.mint || null,
                        presale: true,
                        discountPrice: config.whitelistMintSettings?.discountPrice || null,
                      },
                    });
                  }}
                  style={{
                    border: '1px solid #343d60',
                    boxShadow: burn ? '1px 1px 10px black' : 'none',
                  }}
                >
                  <div className="relative flex flex-col">
                    <div className="flex items-center gap-4">
                      <div
                        className="rounded-full w-5 h-5 border-blue-700 border-2 flex items-center justify-center"
                        style={{
                          border: burn ? '2px solid #054BD2' : '2px solid #8F8F8F',
                        }}
                      >
                        <div
                          className="w-[.7rem] h-[.7rem] rounded-full"
                          style={{
                            background: burn ? '#054BD2' : 'transparent',
                          }}
                        />
                      </div>
                      {' '}
                      <h1 className='text-gray-200'>Burn every time</h1>
                    </div>

                  </div>
                  <p className="text-[#9A9A9A] text-center mt-[3rem]">Whitelist token is burned after the mint</p>
                </div>
              </div>
            </div>
          </div>

          {isDeployed && <div>
            <div className="flex items-center gap-3 mb-2">
              <Image src={BurnMode} alt="Burn" />
              <h1 className="text-gray-200 text-2xl">Strata dynamic mint pricing</h1>

            </div>
            <FormControlLabel
              control={(
                <Checkbox
                  size="medium"
                  onChange={() => setShowDynamicMint(!showDynamicMint)}
                  style={{ marginRight: '0.5rem', marginBottom: '0.1rem' }}
                  defaultChecked={showDynamicMint}
                  checked={showDynamicMint}
                />
              )}
              label="Enable Strata's dynamic mint pricing"
              sx={{ color: '#929292', fontSize: '1.5rem', marginLeft: '5px' }}
            />
            {showDynamicMint && (
              <DynamicMint
                setDynamicMintConfig={setDynamicMintConfig}
                dynamicMintConfig={dynamicMintConfig}
              />
            )}
          </div>
          }
        </div>
        <Button
          style={{
            borderRadius: '.5rem',
            background: '#054BD2',
            color: 'white',
            height: '3rem',
            width: '25%',
            alignSelf: 'end',
            marginRight: '3rem',
            marginBottom: '3rem',
          }}
          endIcon={(isDeployed && network === defaultNetwork) ? <Save /> : null}
          onClick={handleSubmit}
        >
          {isDeployed && network === defaultNetwork ? 'Update configs' : `Deploy on ${network}`}
        </Button>
      </div>
    </LocalizationProvider>
  );
};
