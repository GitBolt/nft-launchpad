import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { SiteData } from '@/types/projectData';
import Close from '@material-ui/icons/Close';

type Props = {
  title: string,
  config: SiteData
  onChange: any
  value: string
  twStyle?: string
};

export const ColourPicker = function ColourPicker({
  title,
  config,
  onChange,
  value,
  twStyle,
}: Props) {
  return (
    <div className={`flex items-center justify-between relative ${twStyle}`}>
      <span className="text-gray-100">{title}</span>
      <HexColorPicker
      // @ts-ignore (will always be string)
        color={config[value as keyof SiteData]}
        onChange={onChange}
        style={{
          position: 'absolute',
          right: '15%',
          bottom: '0',
          display: 'none',
        }}
        id={`picker-${value}`}
      />
      <div
        className="w-6 h-6 flex items-center justify-center cursor-pointer bg-black rounded-full"
        style={{
          position: 'absolute',
          bottom: '210px',
          right: '40px',
          padding: '2px',
          display: 'none',
        }}
        id={`cross-${value}`}
        onClick={() => {
          const element = document.getElementById(`picker-${value}`);
          if (!element) return;
          element.style.display = 'none';
          const crossElement = document.getElementById(`cross-${value}`);
          if (!crossElement) return;
          crossElement.style.display = 'none';
        }}
      >
        <Close style={{ color: 'white' }} />
      </div>
      <div className="flex gap-2">
        <p className="text-gray-300 text-[10px] uppercase">{config[value as keyof SiteData] as string}</p>
        <div
          className="w-6 h-6 cursor-pointer rounded-[0.5rem] border-[1px] border-gray-600"
          style={{
            // @ts-ignore
            background: config[value as keyof SiteData],
          }}
          onClick={() => {
            const elements = document.querySelectorAll<HTMLElement>('[id^="picker"]');
            elements.forEach((element) => {
            // eslint-disable-next-line no-param-reassign
              element.style.display = 'none';
            });
            const element = document.getElementById(`picker-${value}`);
            if (!element) return;
            element.style.display = 'flex';

            const crossElements = document.querySelectorAll<HTMLElement>('[id^="cross"]');
            crossElements.forEach((crossElement) => {
            // eslint-disable-next-line no-param-reassign
              crossElement.style.display = 'none';
            });
            const crossElement = document.getElementById(`cross-${value}`);
            if (!crossElement) return;
            crossElement.style.display = 'flex';
          }}
        />
      </div>
    </div>

  );
};
