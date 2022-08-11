import React from 'react';
import { SiteData } from '@/types/projectData';
import CallMade from '@material-ui/icons/CallMade';

type TemplateProps = {
  siteData?: SiteData
  setSiteData?: React.Dispatch<React.SetStateAction<SiteData>>
  setTemplateChosen: React.Dispatch<React.SetStateAction<boolean>>
  imageSrc: string
  title: string
  setTriggerFetch?: React.Dispatch<React.SetStateAction<boolean>>
  triggerFetch?: boolean
};

const defaultStyling = 'flex flex-col gap-5 w-[30rem] h-[21.7rem] p-5 bg-black rounded-2xl duration-200 cursor-pointer';
export const Template = function Template({
  setSiteData,
  siteData,
  setTemplateChosen,
  imageSrc,
  title,
  setTriggerFetch,
  triggerFetch,
}: TemplateProps) {
  return (
    <div
      className={`${defaultStyling} hover:-translate-y-2 hover:drop-shadow-main`}
      onClick={() => {
        setTemplateChosen(true);
        if (setSiteData && siteData) {
          setSiteData(siteData);
        }
        if (setTriggerFetch && typeof (triggerFetch) !== undefined) {
          setTriggerFetch(!triggerFetch);
        }
      }}
    >
      <img
        alt="preview"
        src={imageSrc}
        className="h-full w-full object-cover rounded-xl border-[1px] border-gray-600"
        style={{
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="flex justify-between">
        <p className="font-bold">{title}</p>
        <CallMade />
      </div>
    </div>

  );
};

export const Custom = function Custom({
  setTemplateChosen,
  setTriggerFetch,
  triggerFetch,
  projectName,
  savedText,
}: any) {
  return (
    <Template
      setTemplateChosen={setTemplateChosen}
      setTriggerFetch={setTriggerFetch}
      triggerFetch={triggerFetch}
      imageSrc="/images/custom.png"
      title={savedText ? `Last saved - ${projectName}` : 'Default'}
    />

  );
};

export const Light = function Light({ setSiteData, setTemplateChosen }: any) {
  return (
    <Template
      setSiteData={setSiteData}
      siteData={{
        bgColor: '#FFFFFF',
        primaryFontColor: '#1A1A1A',
        secondaryFontColor: '#666666',
        buttonBgColor: '#054BD2',
        buttonFontColor: '#FFFFFF',
        fontFamily: 'Varela',
        header: {
          title: '',
          bgColor: '#FFFFFF',
          fontColor: '#000000',
          spacing: 'space-between',
          items: [{ text: 'Contact', link: 'https://example.com' }, { text: 'About', link: 'https://example.com' }],
        },
        sections: null,
        faqSection: { title: 'FAQs', rows: [{ title: 'What theme is this?', content: 'This is Light theme.' }] },
        align: 'center',
      }}
      setTemplateChosen={setTemplateChosen}
      imageSrc="/images/light.png"
      title="Light theme"
    />

  );
};

export const Dark = function Dark({ setSiteData, setTemplateChosen }: any) {
  return (
    <Template
      setSiteData={setSiteData}
      siteData={{
        bgColor: '#0D0D0D',
        primaryFontColor: '#FFFFFF',
        secondaryFontColor: '#CACACA',
        buttonBgColor: '#006EFF',
        buttonFontColor: '#FFFFFF',
        fontFamily: 'Varela',
        header: {
          title: '',
          bgColor: '#0D0D0D',
          fontColor: '#FFFFFF',
          spacing: 'space-between',
          items: [{ text: 'Contact', link: 'https://example.com' }, { text: 'About', link: 'https://example.com' }],
        },
        sections: null,
        faqSection: { title: 'FAQs', rows: [{ title: 'What theme is this?', content: 'This is Dark theme.' }] },
        align: 'center',
      }}
      setTemplateChosen={setTemplateChosen}
      imageSrc="/images/dark.png"
      title="Dark theme"
    />

  );
};

export const BasicBlue = function BassicBlue({ setSiteData, setTemplateChosen }: any) {
  return (
    <Template
      setSiteData={setSiteData}
      siteData={{
        bgColor: '#020918',
        primaryFontColor: '#079aff',
        secondaryFontColor: '#91bcec',
        buttonBgColor: '#054BD2',
        buttonFontColor: '#FFFFFF',
        fontFamily: 'Varela',
        header: {
          title: '',
          bgColor: '#020918',
          fontColor: 'FFFFFF',
          spacing: 'space-between',
          items: [{ text: 'Contact', link: 'https://example.com' }, { text: 'About', link: 'https://example.com' }],
        },
        sections: null,
        faqSection: { title: 'FAQs', rows: [{ title: 'What theme is this?', content: 'This is Basic Blue theme.' }] },
        align: 'center',
      }}
      setTemplateChosen={setTemplateChosen}
      imageSrc="/images/basicblue.png"
      title="Basic Blue theme"
    />

  );
};
