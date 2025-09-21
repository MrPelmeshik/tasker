import React from 'react';
import css from '../../styles/glass-input.module.css';

type GlassInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  fullWidth?: boolean;
  size?: 's' | 'm' | 'l';
};

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  helperText,
  errorText,
  fullWidth,
  size = 'm',
  className,
  ...rest
}) => {
  const wrapperClass = [css.wrapper, fullWidth ? css.fullWidth : '', className]
    .filter(Boolean)
    .join(' ');
  const inputClass = [css.input, css[size], errorText ? css.error : '']
    .filter(Boolean)
    .join(' ');

  return (
    <label className={wrapperClass}>
      {label && <span className={css.label}>{label}</span>}
      <input className={inputClass} {...rest} />
      {errorText ? (
        <span className={css.errorText}>{errorText}</span>
      ) : helperText ? (
        <span className={css.helperText}>{helperText}</span>
      ) : null}
    </label>
  );
};


