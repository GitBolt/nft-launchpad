import React from 'react';
import styles from '@/styles/NFT.module.scss';
import Delete from '@material-ui/icons/Delete';

type Props = {
  link: string,
  name: string,
  id: number,
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>
  setNftName: React.Dispatch<React.SetStateAction<string>>
  setNftId: React.Dispatch<React.SetStateAction<number>>
  isDeployed: boolean
};

export const NFT = function NFT({
  link, name, id, setShowDeleteModal, setNftName, setNftId, isDeployed,
}: Props) {
  return (
    <div
      className={styles.nft}
    >
      <img src={link} alt="nft" className={styles.img} />
      <div className={styles.details}>
        <p className="text-[.9rem] bg-white rounded-2xl px-2">{name}</p>
        {!isDeployed && (
        <div
          className="flex cursor-pointer gap-1"
          onClick={() => {
            setNftName(name);
            setNftId(id);
            setShowDeleteModal(true);
          }}
        >
          <Delete style={{ color: 'red', background: 'white', borderRadius: '50%' }} />
        </div>
        )}
      </div>
    </div>

  );
};
