import React from 'react';
import css from '../../styles/glass-tag.module.css';

type GlassTagProps = {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'danger' | 'success' | 'warning' | 'info' | 'subtle';
  size?: 'xxs' | 'xs' | 's' | 'm' | 'l';
  className?: string;
  icon?: React.ReactNode;
};

export const GlassTag: React.FC<GlassTagProps> = ({ 
  children, 
  variant = 'default', 
  size = 's', 
  className, 
  icon 
}) => {
  const classes = [
    css.tag, 
    css[variant], 
    css[size], 
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      <span className={css.inner}>
        {icon && <span className="icon">{icon}</span>}
        <span className="content">{children}</span>
      </span>
    </span>
  );
};
