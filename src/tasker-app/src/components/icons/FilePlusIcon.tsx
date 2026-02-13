import React from 'react';

type FilePlusIconProps = React.SVGProps<SVGSVGElement>;

/** Иконка файла с плюсом — создать задачу (outline-стиль для лёгкого вида) */
export const FilePlusIcon: React.FC<FilePlusIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <path d="M14 2v6h6" />
    <path d="M12 18v-6" />
    <path d="M9 15h6" />
  </svg>
);
