import React from 'react';
import css from '../../styles/glass-input.module.css';

type GlassSelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  fullWidth?: boolean;
  size?: 's' | 'm' | 'l';
};

export const GlassSelect: React.FC<GlassSelectProps> = ({
  label,
  helperText,
  errorText,
  fullWidth,
  size = 'm',
  className,
  children,
  ...rest
}) => {
  const wrapperClass = [css.wrapper, fullWidth ? css.fullWidth : '', className]
    .filter(Boolean)
    .join(' ');
  const selectClass = [css.input, css[size], errorText ? css.error : '']
    .filter(Boolean)
    .join(' ');

  return (
    <label className={wrapperClass}>
      {label && <span className={css.label}>{label}</span>}
      <select className={selectClass} {...rest}>
        {children}
      </select>
      {errorText ? (
        <span className={css.errorRow}>
          <span className={css.errorText}>{errorText}</span>
        </span>
      ) : helperText ? (
        <span className={css.helperText}>{helperText}</span>
      ) : null}
    </label>
  );
};
