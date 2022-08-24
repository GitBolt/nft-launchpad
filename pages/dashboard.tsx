import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { connectWallet } from '@/components/wallet';
import { DefaultHead } from '@/layouts/Head';
import { PageRoot } from '@/layouts/StyledComponents';
import { Navbar } from '@/layouts/Navbar';
import Link from 'next/link';
import Delete from '@material-ui/icons/Delete';
import { DeleteProjectModal } from '@/layouts/DeleteProjectModal';

const Index: NextPage = function Index() {
  const [publicKey, setPublicKey] = useState<string>('');
  const [projects, setProjects] = useState<any>('');
  const [projectId, setProjectId] = useState<number>(0);
  const [projectName, setProjectName] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      let pubKey = publicKey;
      if (!publicKey) {
        pubKey = await connectWallet(false, false, true);
        setPublicKey(pubKey);
      }
      const res = await fetch(`/api/project/get/public_key/${pubKey}?all=true`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await res.json();
      console.log(data.projects);
      setProjects(data.projects);

    };
    fetchData();
  }, [publicKey, refresh]);
  return (
    <>
      {showDeleteModal && (
        <DeleteProjectModal
          setShowDeleteModal={setShowDeleteModal}
          projectId={projectId}
          projectName={projectName}
          setRefresh={setRefresh}
        />
      )}
      <Navbar />
      <DefaultHead />
      <PageRoot style={{ padding: '0 1.5rem', placeItems: 'center' }}>
        <div className="absolute flex justify-between w-[70%] top-[20%]">
          <h1
            className="text-3xl font-bold text-white"
          >
            Select your NFT collection
          </h1>
          <a href="/new/" target="_blank" style={{
            width: '13rem',
            height: '3rem',
            background: 'linear-gradient(270deg, #A526C5 0%, #5022B1 101.88%)',
            color: 'white',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '500',
            borderRadius: '2rem',
          }}>Create new</a>
        </div>

        <div className="flex flex-wrap justify-center align-center w-full h-[100%] gap-[2rem]" >
          {projects ? projects.map((project: any) => (
            <div key={project.id} style={{ width: '20rem', height: '10rem', borderRadius: '1rem' }} className="hover:bg-[#3431449e] bg-[#211f2d9e] relative">
              <Delete style={{ cursor:'pointer', color: 'red', background: 'transparent', borderRadius: '50%', position: 'absolute', top: '1rem', right: '1rem' }} onClick={() => {
                setProjectId(project.id);
                setProjectName(project.name);
                setShowDeleteModal(true);
              }} />
              <Link href={`/dashboard/nfts?project=${project.id}`}>
                <a style={{ display: 'block', width: '100%', height: '100%' }}>
                  <h1 style={{ color: 'white', fontSize: '2rem', margin: '1rem' }}>{project.name}</h1>
                  <h1 style={{ color: 'gray', fontSize: '1rem', margin: '1rem' }}>{project.description}</h1>
                </a>
              </Link>

            </div>
          )) : <h1 className="text-gray-200 text-2xl w-[100%]">Loading projects...</h1>}
        </div>
      </PageRoot>
    </>
  );
};

export default Index;