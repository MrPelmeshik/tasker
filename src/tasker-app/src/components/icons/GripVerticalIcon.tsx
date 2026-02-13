import React from 'react';

type GripVerticalIconProps = React.SVGProps<SVGSVGElement>;

/** Иконка "захват для перетаскивания" - шесть точек в две колонки */
export const GripVerticalIcon: React.FC<GripVerticalIconProps> = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <circle cx="9" cy="6" r="1.5" fill="currentColor" />
    <circle cx="9" cy="12" r="1.5" fill="currentColor" />
    <circle cx="9" cy="18" r="1.5" fill="currentColor" />
    <circle cx="15" cy="6" r="1.5" fill="currentColor" />
    <circle cx="15" cy="12" r="1.5" fill="currentColor" />
    <circle cx="15" cy="18" r="1.5" fill="currentColor" />
  </svg>
);
