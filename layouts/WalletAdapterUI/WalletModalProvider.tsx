import React, { ReactNode, useState } from 'react';
import { WalletModalContext, WalletModalProps } from '@solana/wallet-adapter-react-ui';
import { WalletModal } from '@/layouts/WalletAdapterUI/WalletModal';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

interface WalletModalProviderProps extends WalletModalProps {
  children: ReactNode;
  setNetwork: React.Dispatch<React.SetStateAction<WalletAdapterNetwork>>;
}

export const WalletModalProvider = function WalletModalProvider({
  children,
  setNetwork,
}: WalletModalProviderProps) {
  const [visible, setVisible] = useState(false);

  return (
    <WalletModalContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        visible,
        setVisible,
      }}
    >
      {children}
      {visible && <WalletModal setNetwork={setNetwork} />}
    </WalletModalContext.Provider>
  );
};
