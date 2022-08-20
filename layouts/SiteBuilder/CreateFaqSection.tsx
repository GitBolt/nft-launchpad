import React from 'react';
import Add from '@material-ui/icons/Add';
import Remove from '@material-ui/icons/Remove';
import { Button } from '@material-ui/core';
import { Row, SiteData } from '@/types/projectData';
import TextareaAutosize from 'react-textarea-autosize';

interface Props {
  siteData: SiteData,
  setSiteData: React.Dispatch<React.SetStateAction<SiteData>>
}
export const CreateFaqSection = function CreateFaqSection({ siteData, setSiteData } : Props) {
  return (
    <div className="mt-24 flex flex-col" style={{ background:siteData.bgColor }}>
      <input
        className="text-5xl duration-200 mb-4 bg-transparent text-left outline-1 outline-blue-400 focus:outline-none hover:outline"
        defaultValue={siteData.faqSection?.title || 'FAQs'}
        maxLength={25}
        autoComplete="false"
        type="text"
        onChange={(e) => {
          if (!e.target.value || !setSiteData) return;
          if (!siteData.faqSection) {
            setSiteData({ ...siteData, faqSection: { title: e.target.value, rows: [] } });
            return;
          }
          // eslint-disable-next-line no-param-reassign
          siteData.faqSection.title = e.target.value;
        }}
      />
      <hr className="w-full h-0.2 outline-gray-500 border-gray-500 mb-5" />
      <div className="flex flex-col gap-4">
        {siteData.faqSection && siteData.faqSection.rows.map((item: Row, index: number) => (
          <div className="flex flex-col gap-2 relative" key={index}>
            <input
              className="text-3xl duration-200 bg-transparent text-left outline-1 outline-blue-400 focus:outline-none hover:outline"
              defaultValue={item.title}
              maxLength={50}
              autoComplete="false"
              type="text"
              style={{
                color: siteData.primaryFontColor,
                filter: 'opacity(80%)',
              }}
              onChange={(e) => {
                if (!e.target.value || !setSiteData) return;
                let rows: Row[];
                if (!siteData.faqSection) {
                  rows = [{ title: e.target.value, content: 'Answer' }];
                } else {
                  rows = siteData.faqSection.rows;
                }
                rows[index].title = e.target.value;
                setSiteData({
                  ...siteData,
                  faqSection: { title: siteData.faqSection?.title || 'FAQs', rows },
                });
              }}
            />
            <TextareaAutosize
              className="text-2xl duration-200 bg-transparent text-left outline-1 outline-blue-400 focus:outline-none hover:outline"
              defaultValue={item.content}
              autoComplete="false"
              style={{
                color: siteData.secondaryFontColor,
              }}
              onChange={(e) => {
                if (!e.target.value || !setSiteData) return;
                let rows: Row[];
                if (!siteData.faqSection) {
                  rows = [{ title: 'Question', content: e.target.value }];
                } else {
                  rows = siteData.faqSection.rows;
                }
                rows[index].content = e.target.value;
                setSiteData({
                  ...siteData,
                  faqSection: { title: siteData.faqSection?.title || 'FAQs', rows },
                });
              }}
            />
            {index !== 0 && (
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              style={{
                position: 'absolute',
                right: '-8rem',
                bottom: '0',
              }}
              endIcon={<Remove />}
              onClick={(e: any) => {
                let rows: Row[];
                if (!siteData.faqSection) {
                  rows = [{ title: 'Question', content: e.target.value }];
                } else {
                  rows = siteData.faqSection.rows;
                }
                rows.splice(index, 1);
                setSiteData({
                  ...siteData,
                  faqSection: {
                    title: siteData.faqSection?.title || 'FAQs',
                    rows,
                  },
                });
              }}
            >
              Remove
            </Button>
            )}
            <hr className="w-full h-0.2 outline-gray-500 border-gray-500" />
          </div>
        ))}
      </div>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<Add />}
        style={{
          alignSelf: 'start',
          margin: '2rem 0rem',
        }}
        onClick={(e: any) => {
          let rows: Row[];
          if (!siteData.faqSection) {
            rows = [{ title: 'Question', content: e.target.value }];
          } else {
            rows = siteData.faqSection.rows;
          }
          rows.push({
            title: 'Question',
            content: 'Answer',
          });
          setSiteData({
            ...siteData,
            faqSection: {
              title: siteData.faqSection?.title || 'FAQs',
              rows,
            },
          });
        }}
      >
        Add question
      </Button>
    </div>
  );
};
