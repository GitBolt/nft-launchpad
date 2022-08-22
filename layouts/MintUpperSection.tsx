import React from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { ProjectData, SiteData } from '@/types/projectData';
import type { CandyMachineAccount } from '@/components/mintCandymachine';

type Props = {
  projectData: ProjectData,
  candyMachine?: CandyMachineAccount | undefined,
  siteData: SiteData,
  itemsRemaining?: number,
  headerSpace?: boolean,
  livePrice: number | undefined,
};
export const MintUpperSection = function MintUpperSection({
  projectData,
  candyMachine,
  siteData,
  itemsRemaining,
  headerSpace,
  livePrice,
}: Props) {
  return (
    <>
      {projectData.banner
        ? <img src={projectData.banner} alt="banner" className="h-56 bg-label w-full object-cover" style={{ marginTop: headerSpace ? '4rem' : '0rem' }} />
        : <div className="h-56 bg-label w-full" />}
      {projectData.logo ? (
        <img
          src={projectData.logo}
          className="rounded-full -translate-y-1/2 relative w-44 h-44 border-8 object-cover"
          alt="logo"
          style={{
            borderColor: siteData.bgColor,
          }}
        />
      )
        : <div className="rounded-full -translate-y-1/2 relative w-44 h-44 border-white border-8 bg-label" />}
      <div className="items-center flex flex-col -translate-y-20 w-full">
        <h1 className="text-4xl font-bold m-[2px]">{projectData.name}</h1>
        <h2
          className="text-gray-400 text-[1.25rem] text-center min-w-5/6 w-4/5 break-all m-[1px]"
          style={{
            color: siteData.secondaryFontColor,
          }}
        >
          {projectData.description}

        </h2>
      </div>
      <div
        style={{ background: siteData.bgColor, color: siteData.secondaryFontColor }}
        className="-translate-y-1/2 w-[42rem] flex justify-between rounded-xl px-6 items-center bg-bg-light brightness-[80%] contrast-[95%]"
      >
        <div className="w-1/2 text-center">
          <p className="text-gray-400">Price</p>
          <p className="text-3xl font-bold">
            {livePrice ? Math.round(livePrice * 10000) / 10000 : candyMachine
              ? candyMachine.state.price.toNumber() / LAMPORTS_PER_SOL : '...'}
            {' '}
            {candyMachine ? 'SOL' : ''}
          </p>
        </div>
        <hr className="h-24 w-0.5 brightness-125 contrast-[85%]" style={{ background: siteData.bgColor, border: siteData.bgColor }} />
        <div className="w-1/2 text-center">
          <p className="text-gray-400">Collection size</p>
          <p className="text-3xl font-bold">{candyMachine?.state.itemsAvailable || '...'}</p>
        </div>
        <hr className="h-24 w-0.5 brightness-125 contrast-[85%]" style={{ background: siteData.bgColor, border: siteData.bgColor }} />
        <div className="w-1/2 text-center">
          <p className="text-gray-400">Items left</p>
          <p className="text-3xl font-bold">{typeof (itemsRemaining) === 'number' ? itemsRemaining : '...'}</p>
        </div>
      </div>
    </>
  );
};

export const MintUpperSectionError = function MintUpperSectionError() {
  return (
    <>
      <div className="h-56 bg-gray-600 w-full" />
      <div className="rounded-full -translate-y-1/2 relative w-44 h-44 border-white border-8 bg-gray-600" />
      <div className="items-center flex flex-col -translate-y-20">
        <h1 className="text-4xl font-bold">Collection not found</h1>
        <h2 className="text-gray-200 text-2xl w-4/5 text-center">This collection does not exist</h2>
      </div>
    </>
  );
};
