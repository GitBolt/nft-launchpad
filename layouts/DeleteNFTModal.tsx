import React from 'react';
import { PageRoot } from '@/layouts/StyledComponents';
import Button from '@material-ui/core/Button';
import Delete from '@/images/Delete.svg';
import Image from 'next/image';
import { connectWallet, signNonce } from '@/components/wallet';
import toast from 'react-hot-toast';

interface Props {
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>
  nftId: number,
  nftName: string
  updateRefresh: React.Dispatch<React.SetStateAction<number>>
}
export const DeleteNFTModal = function WhitelistMintErrorModal({
  setShowDeleteModal, nftId, nftName, updateRefresh,
}: Props) {
  const handleDelete = async () => {
    const public_key = await connectWallet(true, true);
    if (!public_key) return;
    const signature = await signNonce();
    if (!signature) return;
    const data = {
      id: nftId,
      public_key,
      signature,
    };
    const request = await fetch('/api/items/delete', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
    const response = await request.json();
    if (!request.ok) {
      toast.error(response.error || response.detail);
    }
  };

  return (
    <PageRoot
      style={{
        width: '100%',
        background: '#000000c5',
        zIndex: '30',
        minHeight: '100vh',
        height: '100%',
        position: 'fixed',
      }}
    >
      <div className="w-[30rem] h-[20rem] bg-white rounded-2xl flex flex-col items-center justify-center gap-8">
        <div><Image src={Delete} /></div>
        <p className="text-2xl text-center">
          Are you sure you want to delete
          {' '}
          {nftName}
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => setShowDeleteModal(false)}
            style={{
              background: '#F5F5F5',
              padding: '.5rem 1rem',
            }}
          >
            Discard
          </Button>
          <Button
            onClick={async () => {
              await handleDelete();
              updateRefresh(nftId);
              setShowDeleteModal(false);
            }}
            style={{
              background: '#D32F2F',
              color: 'white',
              padding: '.5rem 1rem',
            }}
          >
            Yes, Delete this NFT
          </Button>
        </div>
      </div>
    </PageRoot>
  );
};
