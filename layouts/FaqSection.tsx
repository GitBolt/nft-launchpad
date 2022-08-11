import React from 'react';
// @ts-ignore (types not available for this)
import Faq from 'react-faq-component';
import { FaqData, SiteData } from '@/types/projectData';

interface Props {
  siteData: SiteData
  faqData: FaqData
}
export const FaqSection = function FaqSection({ siteData, faqData }: Props) {
  const styles = {
    titleTextColor: siteData.primaryFontColor,
    rowTitleColor: siteData.primaryFontColor,
    rowContentColor: siteData.secondaryFontColor,
    arrowColor: siteData.secondaryFontColor,
    titleTextSize: '3rem',
    rowTitleTextSize: '1.875rem',
    rowContentTextSize: '1.5rem',
    rowContentTextColor: siteData.secondaryFontColor,
  };

  return (
    <div className="w-1/2 mt-24 mb-10">
      <Faq
        data={faqData}
        styles={styles}
      />
    </div>
  );
};
