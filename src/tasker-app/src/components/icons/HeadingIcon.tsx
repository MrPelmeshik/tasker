import React from 'react';

type HeadingIconProps = React.SVGProps<SVGSVGElement>;

export const HeadingIcon: React.FC<HeadingIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       aria-hidden="true" {...props}>
    <path d="M6 4v16" />
    <path d="M18 4v16" />
    <path d="M6 12h12" />
  </svg>
);
