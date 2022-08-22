import toast from 'react-hot-toast';
import React, { useState } from 'react';
import type { NextPage } from 'next';
import { Box } from '@mui/material';
import { DefaultHead } from '@/layouts/Head';
import { connectWallet, signNonce } from '@/components/wallet';
import { postNetworkRequest } from '@/util/functions';
import { useRouter } from 'next/router';
import { Form } from '@/layouts/Form';
import { Text, PageRoot } from '@/layouts/StyledComponents';
import { uploadFile } from '@/components/uploadToStorage';
import { Navbar } from '@/layouts/Navbar';
import PublishRounded from '@material-ui/icons/PublishRounded';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import getWallet from '@/components/whichWallet';
import { isAlphaNumeric } from '@/util/validation';

interface Errors {
  nameError: string | null,
  twitterUsernameError: string | null,
  descriptionError: string | null,
  bannerError: string | null,
  logoError: string | null
}

const ProjectNew: NextPage = function Index() {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [twitter_username, setTwitterUsername] = useState<string>('`');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [logoUrl, setLogoUrl] = useState<string>('');
  const [bannerUrl, setBannerUrl] = useState<string>('');

  const [error, setError] = useState<Errors>({
    nameError: null,
    twitterUsernameError: null,
    descriptionError: null,
    bannerError: null,
    logoError: null,
  });

  const router = useRouter();
  const wallet = getWallet();
  const handleLogoFile = async (file: File) => {
    setLogoFile(file);
    const promise = uploadFile(file, 1);
    toast.promise(promise, {
      success: 'Uploaded logo',
      loading: 'Uploading logo',
      error: 'Error uploading',
    }).then((logo) => setLogoUrl(logo));
  };

  const handleBannerFile = async (file: File) => {
    setBannerFile(file);
    const promise = uploadFile(file, 1);
    toast.promise(promise, {
      success: 'Uploaded banner',
      loading: 'Uploading banner',
      error: 'Error uploading',
    }).then((banner) => setBannerUrl(banner));
  };

  const register = async () => {
    setError({
      nameError: null,
      twitterUsernameError: null,
      descriptionError: null,
      bannerError: null,
      logoError: null,
    });

    let er1; let er2; let er3; let er4; let er5;
    if (!isAlphaNumeric(name, true)) {
      setError((prevState) => ({ ...prevState, nameError: 'Project name should only be alpha numeric' }));
      er1 = true;
    }
    if (twitter_username === '') {
      setError((prevState) => ({ ...prevState, twitterUsernameError: 'Twitter username can not be empty' }));
      er2 = true;
    }
    if (description === '') {
      setError((prevState) => ({ ...prevState, descriptionError: 'Description cannot be empty' }));
      er3 = true;
    }

    if (!logoFile) {
      setError((prevState) => ({ ...prevState, logoError: 'Logo cannot be empty' }));
      er4 = true;
    }
    if (!bannerFile) {
      setError((prevState) => ({ ...prevState, bannerError: 'Banner cannot be empty' }));
      er5 = true;
    }
    if (er1 || er2 || er3) {
      window.scrollTo(0, 0);
      return;
    } if (er4 || er5) {
      return;
    }
    const public_key = await connectWallet(true, true);
    if (!public_key) return;
    const signature = await signNonce();
    if (!signature) return;
    const sendData = async () => {
      const data = {
        name,
        description,
        twitter_username,
        discord_invite: null,
        logo: logoUrl,
        banner: bannerUrl,
        public_key,
        signature,
      };
      await postNetworkRequest(
        data,
        '/api/project/new',
        undefined,
        true,
      );
    };
    const promise = sendData();
    toast.promise(promise, {
      loading: 'Registering project',
      success: 'Successfully registered',
      error: (err) => err.toString(),
    }).then(() => router.push('/auth/signin')).catch((err) => {
      if (err.toString() === 'Error: Project already exists') {
        router.push('/dashboard/nfts');
      }
    });
  };

  return (
    <>
      <Navbar wallet={wallet} />
      <DefaultHead />
      <PageRoot>
        <Form
          onSubmit={register}
          heading="Create project"
          buttonText="Continue"
          width="medium"
          gap="2rem"
          disableButton={(!!(!logoUrl && logoFile))
            || (!!(!bannerUrl && bannerFile))}
        >
          <Text
            variant="standard"
            onChange={(e) => setName(e.target.value)}
            label="Name of the project"
            error={!!(error.nameError)}
            helperText={error && error.nameError ? error.nameError : null}
          />
          <Text
            variant="standard"
            fullWidth
            onChange={(e) => setTwitterUsername(e.target.value)}
            label="Project's twitter handle"
            error={!!(error.twitterUsernameError)}
            helperText={error && error.twitterUsernameError ? error.twitterUsernameError : null}

          />
          <Text
            variant="standard"
            onChange={(e) => setDescription(e.target.value)}
            label="Description of the project"
            minRows={2}
            error={!!(error.descriptionError)}
            helperText={error && error.descriptionError ? error.descriptionError : null}
          />
          <div className="flex gap-20 items-center relative">
            <div className="flex flex-col items-start">
              <h1 className="text-[1.25rem] text-white">Upload profile image</h1>
              <p className="text-left text-[.9rem] text-[#7D7D7D]">
                The image should be in 1:1 ratio in dimensions
                and should be less than 2 MBs in size.
              </p>
              {(error && error.logoError && !logoFile) && <p className="text-red-500 absolute bottom-[-1.25rem]">You must upload the logo</p>}
            </div>
            {!logoFile && (
            <label htmlFor="logo-button">
              <Box component="span">
                <input
                  onChange={(e) => {
                    if (e.target.files) {
                      handleLogoFile(e.target.files[0]);
                    }
                  }}
                  id="logo-button"
                  type="file"
                  accept="image/*"
                  multiple={false}
                  style={{ display: 'none' }}
                />
                <div className="flex cursor-pointer gap-4 w-[15rem] justify-end">
                  <p className="text-[#5768FF]">Upload image</p>
                  <PublishRounded style={{ color: '#5768FF' }} />
                </div>
              </Box>
            </label>
            )}
            {logoFile && (
            <div className="flex w-[15rem] gap-4 cursor-pointer justify-end">
              <p className="text-[#5768FF]">{logoFile.name}</p>
              <DeleteOutline
                onClick={() => { setLogoFile(null); setLogoUrl(''); }}
                style={{ color: 'red' }}
              />
            </div>
            )}
          </div>

          <div className="flex gap-20 items-center relative">
            <div className="flex flex-col items-start">
              <h1 className="text-[1.25rem] text-white">Upload project banner</h1>
              <p className="text-left text-[.9rem] text-[#7D7D7D]">
                The image should be in 16:9 aspect ratio and should
                be less than 2 MBs in size.
              </p>
              {(error && error.bannerError && !bannerFile) && <p className="text-red-500 absolute bottom-[-1.25rem]">You must upload the banner</p>}
            </div>
            {!bannerFile && (
            <label htmlFor="banner-button">
              <Box component="span">
                <input
                  onChange={(e) => {
                    if (e.target.files) {
                      handleBannerFile(e.target.files[0]);
                    }
                  }}
                  id="banner-button"
                  type="file"
                  accept="image/*"
                  multiple={false}
                  style={{ display: 'none' }}
                />
                <div className="flex cursor-pointer gap-4 w-[15rem] justify-end">
                  <p className="text-[#5768FF]">Upload image</p>
                  <PublishRounded style={{ color: '#5768FF' }} />
                </div>
              </Box>
            </label>
            )}
            {bannerFile && (
            <div className="flex w-[15rem] gap-4 cursor-pointer justify-end">
              <p className="text-[#5768FF]">{bannerFile.name}</p>
              <DeleteOutline
                onClick={() => { setBannerFile(null); setBannerUrl(''); }}
                style={{ color: 'red' }}
              />
            </div>
            )}
          </div>
        </Form>
      </PageRoot>
    </>
  );
};

export default ProjectNew;