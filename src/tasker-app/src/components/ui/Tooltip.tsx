import React from 'react';
import styles from '../../styles/tooltip.module.css';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
type TooltipSize = 's' | 'm' | 'l';

type TooltipProps = {
  content: React.ReactNode;
  placement?: TooltipPlacement;
  size?: TooltipSize;
  className?: string;
  children: React.ReactNode;
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = 'top',
  size = 'm',
  className,
  children,
}) => {
  const wrapperClassName = [styles.trigger].filter(Boolean).join(' ');
  const tooltipClassName = [styles.tooltip, styles[placement], styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={wrapperClassName}>
      {children}
      <span role="tooltip" className={tooltipClassName}>
        {content}
      </span>
    </span>
  );
};


