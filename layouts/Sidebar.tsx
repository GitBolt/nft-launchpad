import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
// import PieChart from '@material-ui/icons/PieChart';
import Dvr from '@material-ui/icons/Dvr';
import Settings from '@material-ui/icons/Settings';
import ArrowBack from '@material-ui/icons/ArrowBack';

type Props = {
  icon: any,
  label: string,
  path: string,
  disabled?: boolean,
  router: any,
};

const SidebarItem = function SidebarItem({
  icon, label, path, disabled,
  router,
}: Props) {
  return (
    <div className={
      `h-14 
        duration-200 font-medium flex
        cursor-not-allowed
        ${!disabled && 'hover:bg-[#1B2E60] hover:text-white cursor-pointer'}
        ${router.asPath === path
        ? 'bg-[#192B59] text-white'
        : 'text-[#A2A2A2]'}`
    }
    >
      {!disabled ? (
        <Link href={path}>
          <a className="flex items-center gap-4 ml-6 block w-full">
            {icon}
            <p>{label}</p>
          </a>
        </Link>
      ) : (
        <div className="flex items-center gap-4 ml-6 block w-full">
          {icon}
          <p>{label}</p>
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  disabled?: boolean
}
export const Sidebar = function Sidebar({ disabled }: SidebarProps) {
  const router = useRouter();
  return (
    <nav className="fixed flex bg-[#0E1228ed] w-72 h-full scroll-auto flex-col items-center overflow-auto">
      <ul className="w-full text-base flex flex-col gap-4 mt-32">
        <SidebarItem
          router={router}
          disabled={disabled}
          icon={<ArrowBack style={{ width: '1.3rem', height: '1.3rem' }} />}
          label="Select project"
          path={'/dashboard'} />
        <SidebarItem
          router={router}
          disabled={disabled}
          icon={<PhotoCamera style={{ width: '1.3rem', height: '1.3rem' }} />}
          label="NFT Collection"
          path={`/dashboard/nfts?project=${router.query.project}`} />
        <SidebarItem
          router={router}
          disabled={disabled}
          icon={<Settings style={{ width: '1.3rem', height: '1.3rem' }} />}
          label="Configure"
          path={`/dashboard/configure?project=${router.query.project}`} />
        <SidebarItem
          router={router}
          disabled={disabled}
          icon={<Dvr style={{ width: '1.3rem', height: '1.3rem' }} />}
          label="Website"
          path={`/dashboard/sitebuilder?project=${router.query.project}`} />
        {/* <SidebarItem disabled={disabled} icon={<PieChart style={{ width: '1.3rem', height: '1.3rem' }} />} label="Analytics" path="/dashboard/analytics" /> */}
      </ul>
    </nav>
  );
};
