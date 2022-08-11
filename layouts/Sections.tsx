import React from 'react';
import { Section } from '@/types/projectData';
import styles from '@/styles/Section.module.scss';

interface Props {
  sections: Section[]
}
export const Sections = function Sections({ sections }: Props) {
  return (
    <div className="w-full mt-24">
      {sections && sections.map((section, index) => (
        <div
          id={`section-${index}`}
          className="w-full flex"
          style={{
            justifyContent: section.align,
            background: section.bgColor,
          }}
          key={index}
        >
          <div
            className="flex rounded-[2rem] relative p-[1rem] m-[0] w-[100%] m-[2rem]"
            style={{
              flexDirection: section.imageAlign === 'left' ? 'row-reverse' : 'row',
              justifyContent: section.align,
            }}
          >
            <div className="flex items-left justify-start flex-col">
              <h1
                className="text-6xl font-bold w-full"
                style={{
                  color: section.fontColor,
                  // @ts-ignore
                  textAlign: section.imageAlign,
                }}
              >
                {section.title}
              </h1>
              <p
                className="text-3xl bg-transparent w-full mt-[8px]"
                style={{
                  color: section.fontColor,
                  // @ts-ignore
                  textAlign: section.imageAlign,
                }}
              >
                {section.content}

              </p>
            </div>
            {section.image && (
              <div
                className={section.wideImage ? styles.image2 : styles.image}
                style={{
                  background: `url(${section.image})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            )}
          </div>
        </div>

      ))}
    </div>

  );
};
