import React from 'react';

type FolderPlusIconProps = React.SVGProps<SVGSVGElement>;

/** Иконка папки с плюсом — создать папку (outline-стиль для лёгкого вида) */
export const FolderPlusIcon: React.FC<FolderPlusIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M12 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H19a2 2 0 0 1 2 2v2" />
    <path d="M17 14v6" />
    <path d="M14 17h6" />
  </svg>
);
