import React, { useState } from 'react';
import { PageRoot } from '@/layouts/StyledComponents';
import Button from '@material-ui/core/Button';
import Delete from '@/images/Delete.svg';
import Image from 'next/image';
import { connectWallet, signNonce } from '@/components/wallet';
import toast from 'react-hot-toast';
import { CircularProgress } from '@material-ui/core';

interface Props {
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>
  projectId: number,
  projectName: string
  setRefresh: React.Dispatch<React.SetStateAction<number>>
}
export const DeleteProjectModal = function DeleteProjectModal({
  setShowDeleteModal, projectId, projectName, setRefresh,
}: Props) {

  const [deleting, setDeleting] = useState<boolean>(false);

  const handleDelete = async () => {
    setDeleting(true);
    const public_key = await connectWallet(true, true);
    if (!public_key) return;
    const signature = await signNonce();
    if (!signature) return;
    const data = {
      id: projectId,
      public_key,
      signature,
    };
    const request = await fetch('/api/project/delete', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
    const response = await request.json();
    if (!request.ok) {
      toast.error(response.error || response.detail);
    }
    setDeleting(false);
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
      <div className="w-[30rem] h-[20rem] bg-[#0F0F16] rounded-2xl flex flex-col items-center justify-center gap-8">
        <div><Image src={Delete} alt="Delete"/></div>
        <p className="text-2xl text-center text-white">
          Are you sure you want to delete
          {' '}
          {projectName}
        </p>
        {deleting ? <CircularProgress/> : <div className="flex gap-4">
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
              setRefresh(projectId);
              await handleDelete();
              setShowDeleteModal(false);
            }}
            style={{
              background: '#D32F2F',
              color: 'white',
              padding: '.5rem 1rem',
            }}
          >
            Proceed
          </Button>
        </div>}
      </div>
    </PageRoot>
  );
};
