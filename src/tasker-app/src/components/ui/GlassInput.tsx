import React from 'react';
import css from '../../styles/glass-input.module.css';

type GlassInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  errorDetails?: string;
  fullWidth?: boolean;
  size?: 's' | 'm' | 'l';
};

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  helperText,
  errorText,
  errorDetails,
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
        <span className={css.errorRow}>
          <span className={css.errorText}>{errorText}</span>
          {errorDetails ? (
            <span className={css.errorIcon} tabIndex={0}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-.55 0-1-.45-1-1v-5c0-.55.45-1 1-1s1 .45 1 1v5c0 .55-.45 1-1 1zm0-8.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/>
              </svg>
              <span className={css.tooltip}>{errorDetails}</span>
            </span>
          ) : null}
        </span>
      ) : helperText ? (
        <span className={css.helperText}>{helperText}</span>
      ) : null}
    </label>
  );
};


