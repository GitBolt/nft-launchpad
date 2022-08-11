import React from 'react';
import { Header } from '@/types/projectData';

type Props = {
  header: Header
};
export const HeaderSection = function HeaderSection({ header }: Props) {
  return (
    <div className="w-full h-16 fixed z-20" style={{ background: header.bgColor, color: header.fontColor }}>
      <div className="flex px-4 h-16 items-center" style={{ justifyContent: header.spacing }}>
        <h1 className="text-3xl font-bold">
          {header.title}
        </h1>
        <div className="flex items-center gap-8 text-md">

          {header.items && header.items.map((item) => (
            <a target="_blank" key={item.link} href={item.link} rel="noreferrer">{item.text}</a>
          ))}
        </div>

      </div>
    </div>
  );
};
