import React from 'react';
import { SiteData } from '@/types/projectData';
import styles from '@/styles/Header.module.scss';
import TextareaAutosize from 'react-textarea-autosize';
import Close from '@material-ui/icons/Close';
import { HeaderToolTip } from '@/layouts/SiteBuilder/Tooltips';

interface Props {
  siteData: SiteData,
  setSiteData: React.Dispatch<React.SetStateAction<SiteData>>
}
export const CreateHeader = function CreateHeader({ siteData, setSiteData } : Props) {
  return (
    <div className="w-full h-16 bg-transparent fixed z-10">
      <div
        className={styles.nav}
        style={{
          background: siteData.header?.bgColor || siteData.bgColor,
          justifyContent: siteData.header?.spacing || 'space-between',
          color: siteData?.header?.fontColor || siteData.primaryFontColor,
        }}
      >
        <HeaderToolTip
          siteData={siteData}
          setSiteData={setSiteData}
          className={styles.tooltip}
          index={0}
        />
        <div>
          <input
            className="text-3xl duration-200 font-bold bg-transparent text-left outline-1 outline-blue-400 focus:outline-none hover:outline"
            defaultValue={siteData.header?.title || 'Title'}
            maxLength={18}
            autoComplete="false"
            type="text"
            onChange={(e) => {
              if (!e.target.value || !setSiteData) return;
              // @ts-ignore (values won't be undefined as defualt value is passed on render)
              setSiteData({ ...siteData, header: { ...siteData.header, title: e.target.value || 'Title' } });
            }}
          />
        </div>
        <div className="flex items-center gap-3 text-md">
          {siteData.header && siteData.header.items.map((item, index) => (
            <div
              className="w-32 relative duration-200 flex flex-col bg-transparent text-left outline-1 outline-blue-400 hover:outline"
              key={index}
            >
              <input
                defaultValue={item.text}
                className="text-center text-md font-bold bg-transparent outline-none"
                onChange={(e) => {
                  if (!e.target.value || !setSiteData) return;
                  const items = siteData.header?.items;
                  if (!items) return;
                  items[index].text = e.target.value;
                  // @ts-ignore (values won't be undefined as defualt value is passed on render)
                  setSiteData({ ...siteData, header: { ...siteData.header, items } });
                }}
              />
              <TextareaAutosize
                defaultValue={item.link}
                className="text-center text-[.75rem] font-bold bg-transparent outline-none"
                onChange={(e) => {
                  if (!e.target.value || !setSiteData) return;
                  const items = siteData.header?.items;
                  if (!items) return;
                  items[index].link = e.target.value;
                  // @ts-ignore (values won't be undefined as defualt value is passed on render)
                  setSiteData({ ...siteData, header: { ...siteData.header, items } });
                }}
              />
              <Close
                onClick={() => {
                  const items = siteData.header?.items || [];
                  items.splice(index, 1);
                  // @ts-ignore (values won't be undefined as defualt value is passed on render)
                  setSiteData({ ...siteData, header: { ...siteData.header, items } });
                }}
                style={{
                  position: 'absolute',
                  top: '-.65rem',
                  right: '-1rem',
                  color: 'white',
                  zIndex: '2',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  background: 'black',
                  borderRadius: '50%',
                  padding: '2px',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
