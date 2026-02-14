import React from 'react';

type UnfoldVerticalIconProps = React.SVGProps<SVGSVGElement>;

/** Иконка развёрнутого дерева — полное разворачивание (stroke-стиль) */
export const UnfoldVerticalIcon: React.FC<UnfoldVerticalIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M7 5l5 5 5-5M7 14l5 5 5-5" />
  </svg>
);
