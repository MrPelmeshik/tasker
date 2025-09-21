import React from 'react';
import css from './glass-button.module.css';

type GlassButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'danger';
  size?: 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl';
};

export const GlassButton: React.FC<GlassButtonProps> = ({ variant = 'default', size = 'm', className, children, ...rest }) => {
  const classes = [css.btn, css[variant], css[size], className].filter(Boolean).join(' ');
  return (
    <button className={classes} {...rest}>
      <span className={css.inner}>{children}</span>
    </button>
  );
};


