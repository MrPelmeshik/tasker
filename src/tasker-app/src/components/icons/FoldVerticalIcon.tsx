import React from 'react';

type FoldVerticalIconProps = React.SVGProps<SVGSVGElement>;

/** Иконка свёрнутого дерева — полное сворачивание (stroke-стиль) */
export const FoldVerticalIcon: React.FC<FoldVerticalIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M7 19l5-5 5 5M7 10l5-5 5 5" />
  </svg>
);
