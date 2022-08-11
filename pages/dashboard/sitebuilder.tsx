import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { DefaultHead } from '@/layouts/Head';
import { BuilderSidebar } from '@/layouts/SiteBuilder/BuilderSidebar';
import { SiteData, ProjectData, FaqData } from '@/types/projectData';
import { connectWallet } from '@/components/wallet';
import Grid from '@material-ui/core/Grid';
import { MintCountdown } from '@/layouts/MintCountdown';
import { MintArea } from '@/layouts/MintArea';
import { MintUpperSection } from '@/layouts/MintUpperSection';
import { EditUpperSection } from '@/layouts/SiteBuilder/EditUpperSection';
import toast from 'react-hot-toast';
import { CreateFaqSection } from '@/layouts/SiteBuilder/CreateFaqSection';
import { FaqSection } from '@/layouts/FaqSection';
import { BuilderNavbar } from '@/layouts/SiteBuilder/BuilderNavbar';
import { CreateHeader } from '@/layouts/SiteBuilder/CreateHeader';
import { HeaderSection } from '@/layouts/HeaderSection';
import { CreateSections } from '@/layouts/SiteBuilder/CreateSections';
import { Sections } from '@/layouts/Sections';

export interface Section {
  title: string,
  content: string,
  align: string
  image: string | null
  imageAlign: string | null
  bgColor: string
  fontColor: string
  wideImage: boolean
}

const defaultSiteData: SiteData = {
  bgColor: '#FFFFFF',
  primaryFontColor: '#1A1A1A',
  secondaryFontColor: '#666666',
  buttonBgColor: '#054BD2',
  buttonFontColor: '#FFFFFF',
  fontFamily: 'Varela',
  header: null,
  faqSection: null,
  align: 'center',
  sections: [
    {
      title: 'About us',
      content: 'Your team details',
      align: 'left',
      image: 'https://media.discordapp.net/attachments/865444983762452520/978948282040586270/Rectangle_1521.png',
      imageAlign: 'left',
      bgColor: 'black',
      fontColor: 'white',
      wideImage: true,
    },
    {
      title: 'Roadmap',
      content: 'Your roadmap',
      align: 'right',
      image: 'https://media.discordapp.net/attachments/865444983762452520/978948281776365579/Rectangle_1522.png',
      imageAlign: 'right',
      bgColor: '#000a22',
      fontColor: '#ffffff',
      wideImage: false,
    },
    {
      title: 'Team',
      content: 'Your team',
      align: 'left',
      image: 'https://media.discordapp.net/attachments/865444983762452520/978948281419833354/Rectangle_1523.png',
      imageAlign: 'left',
      bgColor: '#000000',
      fontColor: '#ffffff',
      wideImage: true,
    },
  ],
};

const Index: NextPage = function Index() {
  const [siteData, setSiteData] = useState<SiteData>(defaultSiteData);

  const [projectData, setProjectData] = useState<ProjectData>({
    id: 0,
    twitter_username: '',
    discord_invite: '',
    name: '',
    description: '',
    logo: null,
    banner: null,
    created_at: '',
  });

  const [fullPreview, setFullPreview] = useState<boolean>(false);
  useEffect(() => {
    const fetchData = async () => {
      localStorage.removeItem('previewImages');
      const publicKey = await connectWallet(true, true);
      const res = await fetch(`/api/project/get/public_key/${publicKey}`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const { project, site } = await res.json();
      setProjectData(project);
      setSiteData({
        ...site,
        faqSection: JSON.parse(site.faqSection),
        header: JSON.parse(site.header),
        sections: JSON.parse(site.sections),
        tabs: JSON.parse(site.tabs),
      });
    };
    fetchData();
  }, []);

  return (
    <>
      <DefaultHead />
      <BuilderNavbar
        siteData={siteData}
        projectData={projectData}
        setFullPreview={setFullPreview}
        fullPreview={fullPreview}
      />
      <BuilderSidebar
        fullPreview={fullPreview}
        siteData={siteData}
        setSiteData={setSiteData}
      />
      <Grid
        style={{
          background: siteData.bgColor,
          color: siteData.primaryFontColor,
          height: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexFlow: 'column',
          alignItems: 'center',
          marginTop: fullPreview ? '0rem' : '4rem',
        }}
        onClick={() => {
          const elements = document.querySelectorAll<HTMLElement>('[id^="picker"]');
          const elements2 = document.querySelectorAll<HTMLElement>('[id^="cross"]');
          elements.forEach((element) => {
            // eslint-disable-next-line no-param-reassign
            element.style.display = 'none';
          });
          elements2.forEach((element) => {
            // eslint-disable-next-line no-param-reassign
            element.style.display = 'none';
          });
        }}
      >
        {(siteData.header && !fullPreview) && (
        <CreateHeader
          siteData={siteData}
          setSiteData={setSiteData}
        />
        )}
        {(siteData.header && fullPreview) && (
        <HeaderSection
          header={siteData.header}
        />
        )}
        {projectData && siteData && !fullPreview && (
          <EditUpperSection
            projectData={projectData}
            siteData={siteData}
            setProjectData={setProjectData}
            headerSpace={!!siteData.header}
          />
        )}
        {projectData && siteData && fullPreview && (
          <MintUpperSection
            projectData={projectData}
            siteData={siteData}
            headerSpace={!!siteData.header}
          />
        )}
        <div className="w-[42rem]">
          <MintCountdown key="goLive" date={new Date()} label="Launching in: " />
        </div>
        <MintArea
          wallet={null}
          rpcUrl="nothing"
          isUserMinting={false}
          onMint={() => { toast('Hey there!'); }}
          isActive
          isWhitelistUser={false}
          isPresale={false}
          candyMachine={undefined}
          connection={undefined}
          setIsUserMinting={() => {}}
          siteData={siteData}
        />

        {(siteData.sections && !fullPreview) && (
          <CreateSections
            siteData={siteData}
            setSiteData={setSiteData}
          />
        )}
        {(siteData.sections && fullPreview) && (
          <Sections
            sections={siteData.sections}
          />
        )}

        {(siteData.faqSection && !fullPreview) && (
        <CreateFaqSection
          siteData={siteData}
          setSiteData={setSiteData}
        />
        )}
        {(siteData.faqSection && fullPreview) && (
          <FaqSection
            faqData={siteData.faqSection as FaqData}
            siteData={siteData}
          />
        )}
      </Grid>
    </>
  );
};

export default Index;
