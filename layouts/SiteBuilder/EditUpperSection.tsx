import React, { useState } from 'react';
import type { ProjectData, SiteData } from '@/types/projectData';
import TextareaAutosize from 'react-textarea-autosize';
import { uploadFile } from '@/components/uploadToStorage';
import CameraAlt from '@material-ui/icons/CameraAlt';
import toast from 'react-hot-toast';

type Props = {
  projectData: ProjectData,
  siteData: SiteData,
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>
  headerSpace?: boolean
};
export const EditUpperSection = function EditUpperSection({
  projectData,
  siteData,
  setProjectData,
  headerSpace,
}: Props) {
  const [logoObj, setLogoObj] = useState<string | null>(null);
  const [bannerObj, setBannerObj] = useState<string | null>(null);

  return (
    <>
      <div
        style={{
          borderColor: siteData.bgColor,
          backgroundImage: `url(${bannerObj || projectData.banner})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          marginTop: headerSpace ? '4rem' : '0rem',
        }}
        className="h-56 bg-label w-full object-cover relative"
      >
        <label htmlFor="icon-button-banner">
          <input
            onChange={(e: any) => {
              if (e.target.files) {
                const promise = uploadFile(e.target.files[0]!, 0);
                toast.promise(promise, {
                  loading: 'Uploading banner',
                  success: 'Successfully uploaded banner',
                  error: 'Error uploading banner',
                }).then((banner) => {
                  setProjectData({ ...projectData, banner });
                  setBannerObj(URL.createObjectURL(e.target.files[0]));
                });
              }
            }}
            id="icon-button-banner"
            type="file"
            multiple={false}
            style={{ display: 'none' }}
          />
          <div className="w-full h-full hover:opacity-50 hover:bg-gray-900 cursor-pointer duration-200">
            <CameraAlt
              style={{
                position: 'absolute',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                background: '#b3cfdd61',
                padding: '0.25rem',
                margin: '1rem 0rem 0rem 1rem',
                color: 'white',
              }}
              className="p-1 "
            />
          </div>
        </label>
      </div>
      <div
        style={{
          borderColor: siteData.bgColor,
          backgroundImage: `url(${logoObj || projectData.logo})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
        className="rounded-full w-44 h-44 relative border-8 -translate-y-1/2"
      >
        <label htmlFor="icon-button-logo">
          <input
            onChange={(e: any) => {
              if (e.target.files) {
                const promise = uploadFile(e.target.files[0]!, 0);
                toast.promise(promise, {
                  loading: 'Uploading logo',
                  success: 'Successfully uploaded logo',
                  error: 'Error upload logo',
                }).then((logo) => {
                  setProjectData({ ...projectData, logo });
                  setLogoObj(URL.createObjectURL(e.target.files[0]));
                });
              }
            }}
            id="icon-button-logo"
            type="file"
            multiple={false}
            style={{ display: 'none' }}
          />
          <div className="hover:opacity-50 hover:bg-gray-900 w-full h-full rounded-full cursor-pointer duration-200">
            <CameraAlt
              style={{
                position: 'absolute',
                top: '50%',
                right: '50%',
                transform: 'translate(50%, -50%)',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                transition: '200ms',
                background: '#b3cfdd61',
                padding: '0.25rem',
                color: 'white',
              }}
            />
          </div>
        </label>
      </div>
      <div className="items-center flex flex-col -translate-y-20 w-full">
        <input
          className="text-4xl duration-200 font-bold bg-transparent text-center outline-1 outline-blue-400 focus:outline-none hover:outline"
          defaultValue={projectData.name}
          maxLength={25}
          autoComplete="false"
          type="text"
          onChange={(e) => {
            if (!e.target.value || !setProjectData) return;
            setProjectData({ ...projectData, name: e.target.value });
          }}
        />

        <TextareaAutosize
          className="h-8 duration-200 scroll-auto min-w-5/6 w-4/5 text-gray-400 text-[1.25rem] bg-transparent text-center outline-1 outline-blue-400 focus:outline-none hover:outline"
          defaultValue={projectData.description}
          onChange={(e) => {
            if (!e.target.value || !setProjectData) return;
            setProjectData({ ...projectData, description: e.target.value });
          }}
          style={{
            color: siteData.secondaryFontColor,
          }}
        />
      </div>
      <div
        style={{ background: siteData.bgColor, color: siteData.secondaryFontColor }}
        className="-translate-y-1/2 w-[42rem] flex justify-between rounded-xl px-6 items-center bg-bg-light brightness-[80%] contrast-[95%] duration-200"
      >
        <div className="w-1/2 text-center">
          <p className="text-gray-400">Base price</p>
          <p className="text-3xl font-bold">...</p>
        </div>
        <hr className="h-24 w-0.5 brightness-125 contrast-[85%]" style={{ background: siteData.bgColor, border: siteData.bgColor }} />
        <div className="w-1/2 text-center">
          <p className="text-gray-400">Collection size</p>
          <p className="text-3xl font-bold">...</p>
        </div>
        <hr className="h-24 w-0.5 brightness-125 contrast-[85%]" style={{ background: siteData.bgColor, border: siteData.bgColor }} />
        <div className="w-1/2 text-center">
          <p className="text-gray-400">Items left</p>
          <p className="text-3xl font-bold">...</p>
        </div>
      </div>
    </>
  );
};

export const MintUpperSectionError = function MintUpperSectionError() {
  return (
    <>
      <div className="h-56 bg-gray-600 w-full" />
      <div className="rounded-full -translate-y-1/2 relative w-44 h-44 border-white border-8 bg-gray-600" />
      <div className="items-center flex flex-col -translate-y-20">
        <h1 className="text-4xl font-bold">Collection not found</h1>
        <h2 className="text-gray-200 text-2xl w-4/5 text-center">This collection does not exist</h2>
      </div>
    </>
  );
};
