import React from 'react';

type ChevronDownIconProps = React.SVGProps<SVGSVGElement>;

/** Иконка шеврона вниз — раскрыть/свернуть (stroke-стиль) */
export const ChevronDownIcon: React.FC<ChevronDownIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
