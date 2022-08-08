import React, {
  MouseEvent,
  useCallback,
} from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import Button from '@material-ui/core/Button';
import { SiteData } from '@/types/projectData';

interface Props {
  children?: React.ReactNode,
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void,
  siteData: SiteData
}
export const WalletModalButton = function WalletModalButton({
  children,
  onClick,
  siteData,
}: Props) {
  const { visible, setVisible } = useWalletModal();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (onClick) onClick(event);
      if (!event.defaultPrevented) setVisible(!visible);
    },
    [onClick, setVisible, visible],
  );

  return (
    <Button
      style={{
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
      }}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
};
