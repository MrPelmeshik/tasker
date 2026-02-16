import React from 'react';

type StrikethroughIconProps = React.SVGProps<SVGSVGElement>;

export const StrikethroughIcon: React.FC<StrikethroughIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       aria-hidden="true" {...props}>
    <path d="M16 4H9a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H8" />
    <line x1="4" y1="12" x2="20" y2="12" />
  </svg>
);
