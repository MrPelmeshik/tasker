import React from 'react';

type SortIconProps = React.SVGProps<SVGSVGElement>;

/** Иконка сортировки — два шеврона вверх-вниз с зазором для читаемости */
export const SortIcon: React.FC<SortIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M7 15l5 5 5-5" />
    <path d="M7 9l5-5 5 5" />
  </svg>
);
