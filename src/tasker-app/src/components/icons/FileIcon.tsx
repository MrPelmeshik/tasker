import React from 'react';

type FileIconProps = React.SVGProps<SVGSVGElement>;

/** Иконка файла — тип объекта (stroke 1.5 для читаемости) */
export const FileIcon: React.FC<FileIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);
