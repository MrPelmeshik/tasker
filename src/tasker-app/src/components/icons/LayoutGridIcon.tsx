import React from 'react';

type LayoutGridIconProps = React.SVGProps<SVGSVGElement>;

/** Иконка сетки/области — тип объекта (stroke 1.5) */
export const LayoutGridIcon: React.FC<LayoutGridIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" fill="none" stroke="currentColor" />
    <rect x="14" y="3" width="7" height="7" rx="1" fill="none" stroke="currentColor" />
    <rect x="3" y="14" width="7" height="7" rx="1" fill="none" stroke="currentColor" />
    <rect x="14" y="14" width="7" height="7" rx="1" fill="none" stroke="currentColor" />
  </svg>
);
