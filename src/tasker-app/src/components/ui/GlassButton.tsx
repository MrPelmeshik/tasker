import React from 'react';
import css from '../../styles/glass-button.module.css';

type GlassButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'danger' | 'success' | 'warning' | 'subtle';
  size?: 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl';
  fullWidth?: boolean;
};

export const GlassButton: React.FC<GlassButtonProps> = ({ variant = 'default', size = 'm', fullWidth, className, children, ...rest }) => {
  const classes = [css.btn, css[variant], css[size], fullWidth ? css.fullWidth : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button className={classes} {...rest}>
      <span className={css.inner}>{children}</span>
    </button>
  );
};


