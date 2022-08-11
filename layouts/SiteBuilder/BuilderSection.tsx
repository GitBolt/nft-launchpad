import React from 'react';

type Props = {
  children: React.ReactNode
  title?: string
};

export const BuilderSection = function BuilderSection({ children, title }: Props) {
  return (
    <div>
      <h1 className="font-bold text-2xl">{title}</h1>
      <div className="rounded-2xl py-4 w-full">
        <div className="flex flex-col gap-4 text-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};
