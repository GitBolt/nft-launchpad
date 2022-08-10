import { BN } from '@project-serum/anchor';
import { CandyMachineAccount } from '@/components/mintCandymachine';
import { toDate, getAtaForMint } from '@/lib/utils';
import * as anchor from '@project-serum/anchor';
import * as web3 from '@solana/web3.js';
import React from 'react';

export const getCountdownDate = (candyMachine: CandyMachineAccount): Date | undefined => {
  if (
    candyMachine.state.isActive
      && candyMachine.state.endSettings?.endSettingType.date
  ) {
    return toDate(candyMachine.state.endSettings.number);
  }
  let date: BN | undefined;
  if (candyMachine.state.goLiveDate) {
    date = candyMachine.state.goLiveDate;
  } else if (candyMachine.state.isPresale) {
    date = new BN(new Date().getTime() / 1000);
  }
  return toDate(date);
};

export const handleWhitelistUser = async (
  cndy: CandyMachineAccount,
  publicKey: web3.PublicKey,
  connection: anchor.web3.Connection,
  setIsWhitelistUser: React.Dispatch<React.SetStateAction<boolean>>,
  setModal: React.Dispatch<React.SetStateAction<string | null>>,
) => {
  if (!cndy || !cndy.state.whitelistMintSettings) return;
  const mint = new anchor.web3.PublicKey(
    cndy.state.whitelistMintSettings.mint,
  );
  const token = (await getAtaForMint(mint, publicKey))[0];
  try {
    const balance = await connection.getTokenAccountBalance(
      token,
    );
    const valid = parseInt(balance.value.amount, 10) > 0;
    if (valid) { setModal('success'); } else { setModal('error'); }
    setIsWhitelistUser(true);
  } catch (e) {
    setIsWhitelistUser(false);
    setModal('error');
    console.log('There was a problem fetching whitelist token balance');
    console.log(e);
  }
};
