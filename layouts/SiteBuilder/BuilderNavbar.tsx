import React from 'react';
import Button from '@mui/material/Button';
import { connectWallet, signNonce } from '@/components/wallet';
import toast from 'react-hot-toast';
import { postNetworkRequest } from '@/util/functions';
import { SiteData, ProjectData } from '@/types/projectData';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import FileCopy from '@material-ui/icons/FileCopy';

interface Props {
  siteData: SiteData,
  projectData: ProjectData,
  setTemplateChosen: React.Dispatch<React.SetStateAction<boolean>>
  setFullPreview: React.Dispatch<React.SetStateAction<boolean>>
  fullPreview: boolean
}

export const BuilderNavbar = function BuilderNavbar({
  siteData,
  projectData,
  setTemplateChosen,
  setFullPreview,
  fullPreview,
}: Props) {
  const handlePublish = () => {
    const post = async () => {
      const public_key = await connectWallet(true, true);
      if (!public_key) return;
      const signature = await signNonce();
      if (!signature) return;
      const data = {
        siteData: {
          ...siteData,
          faqSection: JSON.stringify(siteData.faqSection),
          header: JSON.stringify(siteData.header),
          sections: JSON.stringify(siteData.sections),
        },
        projectData,
        signature,
        public_key,
      };
      console.log(data);
      await postNetworkRequest(
        data,
        '/api/project/update',
        undefined,
        true,
      );
    };
    const promise = post();
    toast.promise(promise, {
      loading: 'Updating website',
      success: 'Successfully updated',
      error: 'Error updating site',
    });
  };

  if (fullPreview) {
    return (
      <Button
        variant="contained"
        color="primary"
        size="small"
        style={{
          position: 'fixed',
          right: '0',
          zIndex: '50',
          borderRadius: '0 0 0 1rem',
        }}
        onClick={() => setFullPreview(false)}
      >
        Close preview

      </Button>
    );
  }
  return (
    <div
      className="w-full h-16 bg-transparent fixed z-10 top-0"
      style={{
        display: fullPreview ? 'none' : 'block',
      }}
    >
      <div className="flex px-4 h-full bg-white items-center justify-between">
        <div className="flex items-center gap-8 text-md">
          <Button
            startIcon={<ArrowBackIos />}
            onClick={() => { setTemplateChosen(false); localStorage.removeItem('previewImages'); }}
            className="text-primary-main text-2xl"
            style={{ color: 'black' }}
          >
            Go back
          </Button>
          <Button
            startIcon={<FileCopy />}
            onClick={() => { navigator.clipboard.writeText(`https://launchpad.up.railway.app/${projectData.name}`); toast.success('Copied mint site link'); }}
            className="text-primary-main text-2xl"
            variant="outlined"
          >
            Copy mint site link
          </Button>
        </div>
        <div className="flex items-center gap-8 text-md">
          <Button
            variant="outlined"
            style={{ color: 'black', borderColor: 'black' }}
            onClick={() => setFullPreview(true)}
          >
            Preview
          </Button>
          <Button
            variant="contained"
            style={{
              background: '#054BD2',
            }}
            onClick={handlePublish}
          >
            Save

          </Button>
        </div>
      </div>
    </div>
  );
};
