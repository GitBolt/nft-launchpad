import React from 'react';
import Add from '@material-ui/icons/Add';
import { Button } from '@material-ui/core';
import { HexColorPicker } from 'react-colorful';
import { SiteData } from '@/types/projectData';

type Props = {
  siteData: SiteData,
  setSiteData: React.Dispatch<React.SetStateAction<SiteData>>
  className: any,
  // eslint-disable-next-line react/no-unused-prop-types
  index: number
};

export const HeaderToolTip = function HeaderToolTip({ siteData, setSiteData, className }: Props) {
  return (
    <div className={className} id="tooltip">
      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        style={{ marginLeft: '2rem' }}
        onClick={() => {
          const items = siteData.header?.items || [];
          items.push({ text: 'Example', link: 'https://example.com' });
          // @ts-ignore (values won't be undefined as defualt value is passed on render)
          setSiteData({ ...siteData, header: { ...siteData.header, items } });
        }}
        disabled={siteData?.header?.items.length === 6}
      >
        Add item

      </Button>
      <hr className="h-full w-[1px] bg-gray-600" />
      <div className="flex flex-col items-center justify-center">
        <p className="text-black">Spacing</p>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
            // @ts-ignore (values won't be undefined as defualt value is passed on render)
              setSiteData({ ...siteData, header: { ...siteData.header, spacing: 'space-evenly' } });
            }}
            style={{
              background: siteData?.header?.spacing === 'space-evenly' ? 'black' : 'white',
              color: siteData?.header?.spacing === 'space-evenly' ? 'white' : 'black',
            }}
          >
            Evenly

          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
            // @ts-ignore (values won't be undefined as defualt value is passed on render)
              setSiteData({ ...siteData, header: { ...siteData.header, spacing: 'space-between' } });
            }}
            style={{
              background: siteData?.header?.spacing === 'space-evenly' ? 'white' : 'black',
              color: siteData?.header?.spacing === 'space-evenly' ? 'black' : 'white',
            }}
          >
            Between

          </Button>
        </div>
      </div>
      <hr className="h-full w-[1px] bg-gray-600" />
      <div className="flex flex-col gap-2">
        <div className="flex items-center relative mr-8 gap-4">
          <p className="text-black text-right w-full">Background color</p>
          <div
            className="w-8 h-6 rounded-lg cursor-pointer"
            style={{ background: siteData.header?.bgColor || siteData.bgColor }}
            onClick={() => {
              const element = document.getElementById('headerBgColor-picker');
              const element2 = document.getElementById('headerFontColor-picker');
              if (!element || !element2) return;
              element.style.display = element.style.display === 'flex' ? 'none' : 'flex';
              element2.style.display = 'none';
            }}
          />
          <HexColorPicker
            color={siteData.header?.bgColor || siteData.bgColor}
            onChange={(color: string) => setSiteData({
              // @ts-ignore (values won't be undefined as defualt value is passed on render)
              ...siteData, header: { ...siteData.header, bgColor: color },
            })}
            style={{
              position: 'absolute',
              left: '110%',
              top: '0',
              display: 'none',
            }}
            id="headerBgColor-picker"
          />
        </div>
        <div className="flex items-center relative mr-8 gap-4">
          <p className="text-black text-right w-full">Font color</p>
          <div
            className="w-8 h-6 rounded-lg cursor-pointer"
            style={{ background: siteData.header?.fontColor || siteData.primaryFontColor }}
            onClick={() => {
              const element = document.getElementById('headerFontColor-picker');
              const element2 = document.getElementById('headerBgColor-picker');
              if (!element || !element2) return;
              element.style.display = element.style.display === 'flex' ? 'none' : 'flex';
              element2.style.display = 'none';
            }}
          />
          <HexColorPicker
            color={siteData.header?.fontColor || siteData.primaryFontColor}
            onChange={(color: string) => setSiteData({
              // @ts-ignore (values won't be undefined as defualt value is passed on render)
              ...siteData, header: { ...siteData.header, fontColor: color },
            })}
            style={{
              position: 'absolute',
              left: '110%',
              top: '0',
              display: 'none',
            }}
            id="headerFontColor-picker"
          />
        </div>
      </div>
    </div>
  );
};

export const SectionToolTip = function SectionToolTip({
  siteData,
  setSiteData,
  className,
  index,
}: Props) {
  return (
    <div className={className} id="sectionTooltip">
      <div className="flex flex-col items-center justify-center">
        <p className="text-black">Section Alignment</p>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              if (!setSiteData) return;
              const { sections } = siteData;
              if (sections && sections[index]) {
                sections[index].align = 'left';
                setSiteData({ ...siteData, sections });
              }
            }}
            style={{
              background: siteData?.sections && siteData.sections[index].align === 'left' ? 'black' : 'white',
              color: siteData?.sections && siteData.sections[index].align === 'left' ? 'white' : 'black',
              width: '2rem',
              height: '1.5rem',
              fontSize: '.75rem',
            }}
          >
            Left

          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              if (!setSiteData) return;
              const { sections } = siteData;
              if (sections && sections[index]) {
                sections[index].align = 'center';
                setSiteData({ ...siteData, sections });
              }
            }}
            style={{
              background: siteData?.sections && siteData.sections[index].align === 'center' ? 'black' : 'white',
              color: siteData?.sections && siteData.sections[index].align === 'center' ? 'white' : 'black',
              width: '2rem',
              height: '1.5rem',
              fontSize: '.75rem',
            }}
          >
            Center

          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              if (!setSiteData) return;
              const { sections } = siteData;
              if (sections && sections[index]) {
                sections[index].align = 'right';
                setSiteData({ ...siteData, sections });
              }
            }}
            style={{
              background: siteData?.sections && siteData.sections[index].align === 'right' ? 'black' : 'white',
              color: siteData?.sections && siteData.sections[index].align === 'right' ? 'white' : 'black',
              width: '2rem',
              height: '1.5rem',
              fontSize: '.75rem',
            }}
          >
            Right

          </Button>
        </div>
      </div>
      <hr className="h-full w-[1px] bg-gray-600" />
      <div className="flex flex-col items-center justify-center">
        <p className="text-black">Image alignment</p>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              if (!setSiteData) return;
              const { sections } = siteData;
              if (sections && sections[index]) {
                sections[index].imageAlign = 'left';
                setSiteData({ ...siteData, sections });
              }
            }}
            style={{
              background: siteData?.sections && siteData.sections[index].imageAlign === 'left' ? 'black' : 'white',
              color: siteData?.sections && siteData.sections[index].imageAlign === 'left' ? 'white' : 'black',
              width: '2rem',
              height: '1.5rem',
              fontSize: '.75rem',
            }}
          >
            Left

          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              if (!setSiteData) return;
              const { sections } = siteData;
              if (sections && sections[index]) {
                sections[index].imageAlign = 'right';
                setSiteData({ ...siteData, sections });
              }
            }}
            style={{
              background: siteData?.sections && siteData.sections[index].imageAlign === 'right' ? 'black' : 'white',
              color: siteData?.sections && siteData.sections[index].imageAlign === 'right' ? 'white' : 'black',
              width: '2rem',
              height: '1.5rem',
              fontSize: '.75rem',
            }}
          >
            Right

          </Button>
        </div>
      </div>
      <hr className="h-full w-[1px] bg-gray-600" />
      <div className="flex flex-col gap-2">
        <div className="flex items-center relative gap-4">
          <p className="text-black w-full">Background color</p>
          <p className="text-gray-300 text-[10px] uppercase w-[2rem]">{siteData.sections && siteData.sections[index].bgColor}</p>
          <div
            className="w-10 h-6 rounded-lg cursor-pointer  border-[1px] border-gray-600"
            style={{
              background: siteData.sections ? siteData.sections[index].bgColor : siteData.bgColor,
            }}
            onClick={() => {
              const element = document.getElementById(`sectionBgPicker-${index}`);
              const element2 = document.getElementById(`sectionFontPicker-${index}`);
              if (!element || !element2) return;
              element.style.display = element.style.display === 'flex' ? 'none' : 'flex';
              element2.style.display = 'none';
            }}
          />
          <HexColorPicker
            color={siteData.header?.fontColor || siteData.primaryFontColor}
            onChange={(color: string) => {
              if (!setSiteData) return;
              const { sections } = siteData;
              if (sections && sections[index]) {
                sections[index].bgColor = color;
                setSiteData({ ...siteData, sections });
              }
            }}
            style={{
              position: 'absolute',
              left: '110%',
              top: '0',
              display: 'none',
            }}
            id={`sectionBgPicker-${index}`}
          />
        </div>
        <div className="flex items-center relative gap-1">
          <p className="text-black w-full">Font color</p>
          <p className="text-gray-300 text-[10px] uppercase">{siteData.sections && siteData.sections[index].fontColor}</p>
          <div
            className="w-10 h-6 rounded-lg cursor-pointer border-[1px] border-gray-600"
            style={{
              background: siteData.sections
                ? siteData.sections[index].fontColor : siteData.primaryFontColor,
            }}
            onClick={() => {
              const element = document.getElementById(`sectionFontPicker-${index}`);
              const element2 = document.getElementById(`sectionBgPicker-${index}`);
              if (!element || !element2) return;
              element.style.display = element.style.display === 'flex' ? 'none' : 'flex';
              element2.style.display = 'none';
            }}
          />
          <HexColorPicker
            color={siteData.header?.fontColor || siteData.primaryFontColor}
            onChange={(color: string) => {
              if (!setSiteData) return;
              const { sections } = siteData;
              if (sections && sections[index]) {
                sections[index].fontColor = color;
                setSiteData({ ...siteData, sections });
              }
            }}
            style={{
              position: 'absolute',
              left: '110%',
              top: '0',
              display: 'none',
            }}
            id={`sectionFontPicker-${index}`}
          />
        </div>
      </div>
    </div>
  );
};
