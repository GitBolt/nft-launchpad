import React, { useState, useEffect } from 'react';
import { SiteData } from '@/types/projectData';
import TextareaAutosize from 'react-textarea-autosize';
import styles from '@/styles/Section.module.scss';
import { SectionToolTip } from '@/layouts/SiteBuilder/Tooltips';
import { FileUploader } from 'react-drag-drop-files';
import toast from 'react-hot-toast';
import { uploadFile } from '@/components/uploadToStorage';
import Image from 'next/image';
import DefaultImage from '@/images/DefaultImage.svg';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

interface Props {
  siteData: SiteData,
  setSiteData: React.Dispatch<React.SetStateAction<SiteData>>
}
type Img = {
  [key: number]: string
};

export const CreateSections = function CreateSections({ siteData, setSiteData } : Props) {
  const [previewImages, setPreviewImages] = useState<any>();

  useEffect(() => {
    setPreviewImages(localStorage.getItem('previewImages'));
  }, []);

  return (
    <div className="w-full mt-24">
      {siteData.sections && siteData.sections.map((section, index) => (
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
            className={styles.section}
            style={{
              flexDirection: section.imageAlign === 'left' ? 'row-reverse' : 'row',
              justifyContent: section.align,
            }}
          >
            <SectionToolTip
              siteData={siteData}
              setSiteData={setSiteData}
              className={styles.tooltip}
              index={index}
            />
            <div
              className="flex items-left justify-start flex-col rounded-2xl px-2"
              style={{
                border: '2px dashed #C4C4C4',
              }}
            >
              <input
                className="text-6xl font-bold w-full bg-transparent outline-1 outline-blue-400 focus:outline-none hover:outline"
                defaultValue={section.title}
                maxLength={30}
                autoComplete="false"
                type="text"
                onChange={(e) => {
                  if (!e.target.value || !setSiteData) return;
                  const { sections } = siteData;
                  if (sections && sections[index]) {
                    sections[index].title = e.target.value;
                    setSiteData({ ...siteData, sections });
                  }
                }}
                style={{
                  color: section.fontColor || siteData.primaryFontColor,
                  // @ts-ignore
                  textAlign: section.imageAlign,
                }}
              />
              <TextareaAutosize
                className="text-3xl bg-transparent w-full outline-1 outline-blue-400 brightness-[70%] focus:outline-none hover:outline"
                defaultValue={section.content}
                onChange={(e) => {
                  if (!e.target.value || !setSiteData) return;
                  const { sections } = siteData;
                  if (sections && sections[index]) {
                    sections[index].content = e.target.value;
                    setSiteData({ ...siteData, sections });
                  }
                }}
                style={{
                  color: section.fontColor || siteData.primaryFontColor,
                  // @ts-ignore
                  textAlign: section.imageAlign,
                }}
              />
            </div>
            <FileUploader handleChange={(e: any) => {
              if (e) {
                const promise = uploadFile(e, 0);
                toast.promise(promise, {
                  loading: 'Uploading image',
                  success: 'Successfully uploaded image',
                  error: 'Error uploading image',
                }).then((imageUrl) => {
                  let newImages: Img = previewImages || {};
                  if (typeof (newImages) === 'string') { newImages = JSON.parse(newImages); }
                  newImages[index] = '';
                  newImages[index] = URL.createObjectURL(e);
                  localStorage.setItem('previewImages', JSON.stringify(newImages));
                  const { sections } = siteData;
                  if (sections && sections[index]) {
                    sections[index].image = imageUrl;
                    setSiteData({ ...siteData, sections });
                  }
                });
              }
            }}
            >
              <div
                className={section.wideImage ? styles.image2 : styles.image}
                style={{
                  border: JSON.parse(previewImages || '0')[index]
                  || (siteData.sections && siteData.sections[index].image) ? 'none'
                    : '2px dashed #C4C4C4',
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  background: `url(${(previewImages
                  // @ts-ignore
                    && JSON.parse(previewImages)[index])
                    || (siteData.sections && siteData.sections[index].image) || ''})`,
                }}
              >
                {(!((previewImages
                // @ts-ignore
                && JSON.parse(previewImages)[index])
                || (siteData.sections && siteData.sections[index].image))) && (
                  <Image src={DefaultImage} height="100%" width="100" color="red" alt="Default" />
                ) }
              </div>
            </FileUploader>
            <FormControlLabel
              control={(
                <Checkbox
                  style={{
                    color: '#00B71D',
                  }}
                  defaultChecked={section.wideImage}
                  onChange={(e) => {
                    if (!e.target.value || !setSiteData) return;
                    const { sections } = siteData;
                    if (sections && sections[index]) {
                      sections[index].wideImage = !sections[index].wideImage;
                      setSiteData({ ...siteData, sections });
                    }
                  }}
                />
            )}
              label="Wide image"
              style={{
                color: 'white',
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: '#404040',
                borderRadius: '.5rem',
                padding: '5px',
              }}
            />
          </div>
        </div>

      ))}
    </div>
  );
};
