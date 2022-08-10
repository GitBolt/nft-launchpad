import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { connectWallet } from '@/components/wallet';
import AccountBalanceWallet from '@material-ui/icons/AccountBalanceWallet';
import toast from 'react-hot-toast';
import { Menu, MenuItem, Button } from '@material-ui/core';
import getWallet from '@/components/whichWallet';

interface Props {
  bottomOutline?: boolean
  wallet: any
  setWallet?: any
  setBool?: React.Dispatch<React.SetStateAction<boolean>>
}
export const Navbar = function Navbar({
  bottomOutline, wallet, setWallet, setBool,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    if (wallet && wallet.isConnected) {
      setAnchorEl(event.currentTarget);
      return;
    }
    if (!wallet.isConnected) {
      await connectWallet(false, true);
      if (setBool) setBool(true);
      if (setWallet) setWallet(getWallet());
      return;
    }
    setAnchorEl(null);
    const pubKey = await connectWallet(false, true);
    const res = await fetch(`/api/user/get/${pubKey}`);
    if (res.ok && router.pathname === '/') {
      router.push(`/new/${pubKey}`);
    }
  };

  return (
    <div
      className="w-full h-[6rem] bg-transparent fixed z-10"
    >
      <div
        className="flex px-[3.75rem] h-[6rem] bg-[#0F1327] items-center justify-between"
        style={{
          borderBottom: bottomOutline ? '2px solid #D9D9D9' : '',
        }}
      >
        <h1 className="text-white text-3xl font-bold">Launchpad</h1>
        <div className="flex items-center gap-8 text-[1rem]">
          <div className="flex flex-col gap-6">
            <div>
              <Button
                style={{
                  borderRadius: '.5rem',
                  background: '#054BD2',
                  color: 'white',
                  height: '2.5rem',
                }}
                onClick={handleClick}
                startIcon={<AccountBalanceWallet style={{ width: '1.5rem', height: '1.5rem' }} />}
                variant="contained"
              >
                {(wallet
                  && wallet.isConnected
                  && wallet.publicKey.toString().replace(wallet.publicKey.toString().slice(5, 40), '...'))
                  || 'Connect'}
              </Button>
              <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                disableScrollLock
                style={{ marginTop: '3.5rem' }}
              >
                <div className="flex flex-col p-1 gap-3">
                  <MenuItem
                    onClick={async () => {
                      navigator.clipboard.writeText(wallet.publicKey.toString());
                      toast.success('Copied address to clipboard');
                      setAnchorEl(null);
                    }}
                    style={{ background: '#F2F2F2', borderRadius: '.5rem', padding: '.5rem .7rem' }}
                  >
                    Copy to clipboard

                  </MenuItem>
                  <MenuItem
                    onClick={async () => {
                      await wallet.disconnect();
                      setAnchorEl(null);
                      if (setBool) setBool(false);
                    }}
                    style={{ background: '#F2F2F2', borderRadius: '.5rem', padding: '.5rem .7rem' }}
                  >
                    Disconnect
                  </MenuItem>
                </div>
              </Menu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};