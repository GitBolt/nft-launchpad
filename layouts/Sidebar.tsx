import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from '@material-ui/icons/Image';
// import PieChart from '@material-ui/icons/PieChart';
import DesktopWindows from '@material-ui/icons/DesktopWindows';
import Settings from '@material-ui/icons/Settings';

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
      `rounded-xl h-14 
        duration-200 font-medium flex
        cursor-not-allowed
        ${!disabled && 'hover:bg-[#1B2E60] hover:text-white cursor-pointer'}
        ${router.pathname === path
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
    <nav className="fixed flex bg-[#0F0921] w-80 h-full scroll-auto flex-col items-center overflow-auto">
      <ul className="w-4/5 text-base flex flex-col gap-4 mt-32">
        <SidebarItem
          router={router}
          disabled={disabled}
          // eslint-disable-next-line jsx-a11y/alt-text
          icon={<Image style={{ width: '1.3rem', height: '1.3rem' }}/>}
          label="NFT Collection"
          path={`/dashboard/nfts?project_id=${router.query.project}`} />
        <SidebarItem
          router={router}
          disabled={disabled}
          icon={<Settings style={{ width: '1.3rem', height: '1.3rem' }} />}
          label="Configure"
          path="/dashboard/configure" />
        <SidebarItem
          router={router}
          disabled={disabled}
          icon={<DesktopWindows style={{ width: '1.3rem', height: '1.3rem' }} />}
          label="Site builder"
          path="/dashboard/sitebuilder" />
        {/* <SidebarItem disabled={disabled} icon={<PieChart style={{ width: '1.3rem', height: '1.3rem' }} />} label="Analytics" path="/dashboard/analytics" /> */}
      </ul>
    </nav>
  );
};
