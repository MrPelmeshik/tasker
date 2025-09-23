import React from 'react';

type PlusIconProps = React.SVGProps<SVGSVGElement>;

export const PlusIcon: React.FC<PlusIconProps> = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);
