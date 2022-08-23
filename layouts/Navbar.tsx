import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { connectWallet } from '@/components/wallet';
import toast from 'react-hot-toast';
import { Menu, MenuItem, Button } from '@material-ui/core';
import { useWallet } from '@solana/wallet-adapter-react';
import { ConnectWallet } from '@/layouts/Wallet';

export const Navbar = function Navbar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { wallet, connected, publicKey, disconnect } = useWallet();

  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    if (connected) {
      setAnchorEl(event.currentTarget);
      return;
    }
    if (!connected) {
      await connectWallet(false, true);
      return;
    }
    setAnchorEl(null);
    const pubKey = await connectWallet(false, true);
    const res = await fetch(`/api/user/get/${pubKey}`);
    if (res.ok && router.pathname === '/') {
      router.push('/new/');
    }
  };


  return (
    <div
      className="w-full h-[6rem] bg-transparent fixed z-10"
    >
      <div
        className="flex px-[3.75rem] h-[4rem] bg-[#0E1228ed] items-center justify-between"
        style={{ backdropFilter: 'blur(10px)' }}
      >
        <h1 className="text-white text-3xl font-bold">Launchpad</h1>
        <div className="flex flex-col gap-6">
          {connected ?
            < >
              <Button
                style={{
                  borderRadius: '2rem',
                  color: 'white',
                  height: '2.5rem',
                  width: '12rem',
                  borderWidth: '2px',
                }}
                onClick={handleClick}
                variant="outlined"
                color="primary"
                disableRipple
              >
                {(wallet && connected
                  && publicKey!.toString().replace(publicKey!.toString().slice(7, 38), '...'))
                  || 'Connect'}
              </Button>
              <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                disableScrollLock
                style={{ marginTop: '3.5rem' }}
              >
                {wallet && publicKey && <div className="flex flex-col p-1 gap-3 bg-[hsl(220, 80%, 65%)]">
                  <MenuItem
                    disableRipple
                    onClick={async () => {
                      navigator.clipboard.writeText(publicKey.toString());
                      toast.success('Copied address to clipboard');
                      setAnchorEl(null);
                    }}
                    style={{ border: '1px solid #7B0FAE', color: 'white', borderRadius: '.5rem', padding: '.5rem .7rem' }}
                  >
                    Copy to clipboard

                  </MenuItem>
                  <MenuItem
                    disableRipple
                    onClick={async () => {
                      await disconnect();
                      setAnchorEl(null);
                    }}
                    style={{ border: '1px solid #7B0FAE', color: 'white', borderRadius: '.5rem', padding: '.5rem .7rem' }}
                  >
                    Disconnect
                  </MenuItem>
                </div>}
              </Menu>
            </>
            : <ConnectWallet>
              <Button style={{
                borderRadius: '2rem',
                borderWidth: '2px',
                color: 'white',
                height: '2.5rem',
                width: '12rem',
              }}
                disableRipple
                variant="outlined"
                color="primary"
              >
                Connect Wallet
              </Button>
            </ConnectWallet>}
        </div>
      </div>
    </div>
  );
};