import React, { useState } from 'react';
import { SiteData } from '@/types/projectData';
import { ColourPicker } from '@/layouts/SiteBuilder/ColourPicker';
import { BuilderSection } from '@/layouts/SiteBuilder/BuilderSection';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Add from '@material-ui/icons/Add';
import Remove from '@material-ui/icons/Remove';
import { Button } from '@material-ui/core';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';

interface Props {
  fullPreview: boolean,
  siteData: SiteData,
  setSiteData: React.Dispatch<React.SetStateAction<SiteData>>
}
export const BuilderSidebar = function BuilderSidebar({
  fullPreview,
  siteData,
  setSiteData,
}: Props) {
  const [sectionPage, setSectionPage] = useState<boolean>(false);
  const [minimized, setMinimized] = useState<boolean>(false);

  return (
    <div
      className="rounded-2xl fixed flex bg-white w-[22rem] flex-col right-5 bottom-5 items-center z-20 drop-shadow-main"
      style={{
        display: fullPreview ? 'none' : '',
        overflowY: sectionPage ? 'scroll' : (minimized && 'hidden') || 'visible',
        height: minimized ? '3rem' : '28rem',
        transition: '300ms',
      }}
    >
      <div className="mb-4" />
      {minimized && <h1 className="text-gray-100 mr-3">Click on the arrow to expand</h1>}
      <div
        className="absolute top-4 right-5 cursor-pointer"
        onClick={() => setMinimized(!minimized)}
      >
        {minimized ? <ArrowDropUp style={{ width: '2rem', height: '2rem' }} /> : <ArrowDropDown style={{ width: '2rem', height: '2rem' }} />}
      </div>
      {!minimized && (
      <ul className="w-4/5 text-base flex flex-col text-sm">
        {!sectionPage ? (
          <>
            <BuilderSection title="Colors">
              <ColourPicker
                title="Background"
                onChange={(color: string) => setSiteData({ ...siteData, bgColor: color })}
                value="bgColor"
                config={siteData}
              />
              <ColourPicker
                title="Primary Font"
                onChange={(color: string) => setSiteData({ ...siteData, primaryFontColor: color })}
                value="primaryFontColor"
                config={siteData}
              />
              <ColourPicker
                title="Secondary Font"
                onChange={(color: string) => setSiteData({
                  ...siteData,
                  secondaryFontColor: color,
                })}
                value="secondaryFontColor"
                config={siteData}
              />
              <ColourPicker
                title="Button Font"
                onChange={(color: string) => setSiteData({ ...siteData, buttonFontColor: color })}
                value="buttonFontColor"
                config={siteData}
              />
              <ColourPicker
                title="Button Background"
                onChange={(color: string) => setSiteData({ ...siteData, buttonBgColor: color })}
                value="buttonBgColor"
                config={siteData}
              />
            </BuilderSection>
            <BuilderSection title="Content">

              <div
                className="flex justify-between cursor-pointer"
                onClick={() => setSiteData({
                  ...siteData,
                  header: !siteData.header ? {
                    bgColor: siteData.bgColor,
                    title: 'Title',
                    items: [],
                    spacing: 'space-between',
                    fontColor: siteData.secondaryFontColor,
                  } : null,
                })}
              >
                <span>Header</span>
                <span className="text-gray-300">{siteData.header ? 'Remove' : 'Add'}</span>
              </div>
              <div
                className="flex justify-between cursor-pointer"
                onClick={() => setSiteData({ ...siteData, faqSection: !siteData.faqSection ? { title: 'FAQs', rows: [] } : null })}
              >
                <span>FAQs</span>
                <span className="text-gray-300">{siteData.faqSection ? 'Remove' : 'Add'}</span>
              </div>
              {/* <div
                className="flex justify-between cursor-pointer"
                onClick={() => setSectionPage(true)}
              >
                <span>Sections</span>
                <span className="text-gray-300"><ArrowForward /></span>
              </div> */}
            </BuilderSection>

          </>
        ) : (
          <>
            <div className="text-gray-300 flex justify-between w-full w-[90%] items-center">
              <ArrowBack
                onClick={() => { setSectionPage(false); localStorage.removeItem('previewImages'); }}
                style={{ cursor: 'pointer' }}
              />
              <Button
                onClick={() => {
                  const sections = siteData.sections || [];
                  sections.push({
                    title: 'New section',
                    content: 'Content',
                    align: 'center',
                    image: null,
                    imageAlign: 'right',
                    bgColor: '#FFFFFF',
                    fontColor: '#000000',
                    wideImage: false,
                  });
                  setSiteData({
                    ...siteData,
                    sections,
                  });
                }}
                variant="contained"
                color="primary"
                size="small"
                startIcon={<Add />}
              >
                Add

              </Button>
            </div>
            <BuilderSection title="Sections">
              {siteData.sections && siteData.sections.map((section, index) => (
                <>
                  <div
                    className="flex justify-between w-full cursor-pointer"
                    onClick={() => {
                      const element = document.getElementById(`section-${index}`);
                      if (!element) return;
                      element.scrollIntoView(true);
                    }}
                  >
                    <p className="w-[70%] whitespace-nowrap overflow-hidden text-ellipsis">{section.title}</p>
                    <Remove
                      onClick={() => {
                        const { sections } = siteData;
                        if (!sections) return;
                        sections.splice(index, 1);
                        setSiteData({ ...siteData, sections });
                        localStorage.removeItem('previewImages');
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <hr className="w-full h-[1px] bg-gray-600 border-gray-600" />
                </>
              ))}
            </BuilderSection>
          </>
        )}

      </ul>
      )}
    </div>
  );
};
