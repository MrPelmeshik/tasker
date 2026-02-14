import React from 'react';

type ArrowUpDownIconProps = React.SVGProps<SVGSVGElement>;

/** Иконка стрелок вверх-вниз — сортировка */
export const ArrowUpDownIcon: React.FC<ArrowUpDownIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M7 15l5 5 5-5" />
    <path d="M7 9l5-5 5 5" />
  </svg>
);
