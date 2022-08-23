import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { connectWallet } from '@/components/wallet';
import { DefaultHead } from '@/layouts/Head';
import { PageRoot } from '@/layouts/StyledComponents';
import { Sidebar } from '@/layouts/Sidebar';
import { NFT } from '@/layouts/NFT';
import Box from '@mui/material/Box';
import Button from '@material-ui/core/Button';
import { UploadCollectionArea } from '@/layouts/UploadCollectionArea';
import { Navbar } from '@/layouts/Navbar';
import PublishRounded from '@material-ui/icons/PublishRounded';
import { UploadPage } from '@/layouts/UploadPage';
import { DeleteNFTModal } from '@/layouts/DeleteNFTModal';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIos from '@material-ui/icons/ArrowForwardIos';
import CircularProgress from '@mui/material/CircularProgress';
import { FileUploader } from 'react-drag-drop-files';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

export interface Item {
  id: number,
  name: string,
  link: string,
  assetUri: string,
}

const Index: NextPage = function Index() {
  const router = useRouter();
  const [items, setItems] = useState<Item[] | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [publicKey, setPublicKey] = useState<string>('');
  const [isDeployed, setIsDeployed] = useState<boolean>(true);
  const [firstTime, setFirstTime] = useState<boolean>(false);

  const [totalCount, setTotalCount] = useState<number>(0); // to show all nfts count
  const [uploadedFileCount, setUploadedFileCount] = useState<number>(0); // current upload count
  const [offset, setOffset] = useState<number>(0);

  const [uploadPage, setUploadPage] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [nftName, setNftName] = useState<string>('');
  const [nftId, setNftId] = useState<number>(0);
  const [refresh, updateRefresh] = useState<number>(0);
  const [missingIndexes, setMissingIndexes] = useState<string[]>([]);
  const [resumeIndex, setResumeIndex] = useState<number>(0);
  const [project_id, setProjectId] = useState<number>(0);

  useEffect(() => {
    const { project } = router.query;
    if (!project) return;
    setProjectId(Number(project));
    const fetchData = async () => {
      let pubKey = publicKey;
      if (!publicKey) {
        pubKey = await connectWallet(false, false, true);
        setPublicKey(pubKey);
      }
      console.log('sending request', project);
      const res = await fetch(`/api/items/get/${pubKey}?project_id=${project}&&offset=${offset}`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await res.json();
      setItems(data.items.length > 0 ? data.items : null);

      const filesSorted: any = Array.from(data.items).sort(
        (a: any, b: any) => Number(a.name) - Number(b.name),
      );
      const lastIndex = filesSorted[filesSorted.length - 1];
      setResumeIndex(lastIndex ? Number(lastIndex.name) + 1 : 0);
      const missing = [];
      for (let i = 0; i !== data.items.length; i += 1) {
        if (data.items.map((e: any) => e.name).indexOf(`${i}`) === -1) {
          missing.push(`${i}.png`);
        }
      }
      console.log('Missing files', missing);
      setMissingIndexes(missing);
      const stateRes = await fetch(`/api/candymachine/state/${project}`);
      const { deployed, itemCount } = await stateRes.json();
      setTotalCount(itemCount);
      if (deployed) {
        setIsDeployed(true);
      } else { setIsDeployed(false); }
      if (itemCount === 0) {
        setFirstTime(true);
      } else {
        setFirstTime(false);
      }
    };
    fetchData();
  }, [publicKey, uploadPage, firstTime, refresh, offset, uploadedFileCount, router.query]);
  return (
    <>
      <DefaultHead />
      <Navbar />
      {showDeleteModal && (
      <DeleteNFTModal
        setShowDeleteModal={setShowDeleteModal}
        nftId={nftId}
        nftName={nftName}
        updateRefresh={updateRefresh}
      />
      )}
      <PageRoot>
        <div className="w-[100vw]">
          <Sidebar />
          <PageRoot style={{ marginLeft: '21rem', display: 'block' }}>
            <div className="flex justify-between mt-32">
              <h1
                className="text-3xl font-bold text-white"
              >
                NFT collection
              </h1>
              {((!isDeployed && !uploadedFileCount && !firstTime)
              || (files && files.length / 2 === uploadedFileCount && totalCount)) ? (
                <FileUploader
                  multiple
                  handleChange={async (getFiles: FileList) => {
                    if (!getFiles) { return; }
                    const JSONFiles = Array.from(getFiles).filter((file: File) => file.name.endsWith('.json')).sort(
                      (a, b) => Number(b.name.split('.')[0]) - Number(a.name.split('.')[0]),
                    );
                    const PNGFiles = Array.from(getFiles).filter((file: File) => file.name.endsWith('.png')).sort(
                      (a, b) => Number(a.name.split('.')[0]) - Number(b.name.split('.')[0]),
                    );
                    if (PNGFiles.length !== JSONFiles.length) {
                      toast.error('Number of PNG files and JSON files should be equal');
                      return;
                    }
                    if (!PNGFiles.some((e) => missingIndexes.indexOf(e.name) >= 0)
                    && !(PNGFiles.map((e) => e.name).includes(`${resumeIndex}.png`))
                    ) {
                      toast.error('Invalid image file number');
                      return;
                    }
                    setFiles(getFiles);
                  }}
                >
                  <Button
                    style={{
                      borderRadius: '.5rem',
                      padding: '0 2rem',
                      fontSize: '1rem',
                      background: '#0E2C97',
                      color: 'white',
                      height: '2.5rem',
                      marginRight: '4rem',
                    }}
                    endIcon={<PublishRounded />}
                  >
                    Upload
                  </Button>
                </FileUploader>
                ) : null}
            </div>

            {firstTime && !files && (
            <UploadPage
              setFiles={setFiles}
              totalCount={totalCount}
              filesSelected={!!files}
            />
            )}
            {(!isDeployed) && (
            <UploadCollectionArea
              totalCount={totalCount}
              uploadPage={uploadPage}
              setUploadPage={setUploadPage}
              setFiles={setFiles}
              files={files!}
              missingIndexes={missingIndexes}
              uploadedFileCount={uploadedFileCount}
              setUploadedFileCount={setUploadedFileCount}
              resumeCount={resumeIndex}
              publicKey={publicKey}
              hideUploadArea
              project_id={project_id}
            />
            )}
            {!totalCount && (uploadedFileCount ? !totalCount : false) && !files
              ? <h1 className="text-3xl mt-2 text-gray-300">Refresh the page to upload assets again</h1> : null}
            {((items && uploadPage) || !firstTime) && (
              <Box style={{
                marginTop: '2rem',
              }}
              >
                <div className="flex items-center justify-center">
                  <h2 className="text-gray-200 text-xl font-medium w-1/2">
                    {totalCount}
                    {' '}
                    NFTs found
                  </h2>
                  <div className="flex items-center w-full justify-end gap-2 mr-16">
                    <Button
                      onClick={() => { setItems(null); setOffset(0); }}
                      disabled={!items || offset === 0}
                      style={{ color: 'white' }}
                    >
                      First
                    </Button>
                    <Button
                      onClick={() => { setItems(null); setOffset(offset - 1); }}
                      disabled={!items || offset === offset - 1 || offset === 0}
                      style={{ color: 'white' }}
                    >
                      <ArrowBackIos color="primary"/>
                    </Button>
                    <p className="text-[#6B7280] gap-6">
                      Page
                      {' '}
                      {offset + 1}
                      {' '}
                      of
                      {' '}
                      {Math.floor(totalCount / 30) + 1}
                    </p>
                    <Button
                      className="bg-[#E7E7E8] px-4 py-[7px] rounded-1xl text-[#6B7280]"
                      onClick={() => { setItems(null); setOffset(offset + 1); }}
                      disabled={!items || offset === offset + 1
                        || (Math.floor(totalCount / 30) + 1 === offset + 1)}
                        style={{ color: 'white' }}
                    >
                      <ArrowForwardIos color="primary" />
                    </Button>
                    <Button
                      className="bg-[#E7E7E8] px-4 py-2 rounded-1xl text-[#6B7280]"
                      disabled={!items || offset === Math.floor(totalCount / 30)}
                      onClick={() => { setItems(null); setOffset(Math.floor(totalCount / 30)); }}
                      style={{ color: 'white' }}
                    >
                      Last
                    </Button>

                  </div>
                </div>
                <h3 className="mb-6 text-gray-300">
                  Showing from
                  {' '}
                  {offset === 0 ? offset + 1 : offset * 30}
                  {' '}
                  to
                  {' '}
                  {items
                  && Math.floor(totalCount / 30) !== offset ? (offset + 1) * 30 : totalCount}
                  {' '}
                  NFTs
                </h3>
                <div className="flex gap-8 w-full flex-wrap mb-16">
                  {items ? items.map((item) => (
                    <NFT
                      key={item.id}
                      link={item.assetUri}
                      name={item.name}
                      id={item.id}
                      setShowDeleteModal={setShowDeleteModal}
                      setNftId={setNftId}
                      setNftName={setNftName}
                      isDeployed={isDeployed}
                    />
                  )) : <CircularProgress />}
                </div>
              </Box>
            )}
          </PageRoot>
        </div>
      </PageRoot>
    </>
  );
};

export default Index;