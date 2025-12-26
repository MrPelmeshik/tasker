import React from 'react';
import css from '../../styles/glass-input.module.css';
import { Tooltip } from './Tooltip';
import { ErrorInfoIcon } from '../icons/ErrorInfoIcon';

type GlassInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  errorDetails?: string;
  fullWidth?: boolean;
  size?: 's' | 'm' | 'l';
  disabled?: boolean;
};

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  helperText,
  errorText,
  errorDetails,
  fullWidth,
  size = 'm',
  disabled = false,
  className,
  ...rest
}) => {
  const wrapperClass = [css.wrapper, fullWidth ? css.fullWidth : '', className]
    .filter(Boolean)
    .join(' ');
  const inputClass = [css.input, css[size], errorText ? css.error : '', disabled ? css.disabled : '']
    .filter(Boolean)
    .join(' ');

  return (
    <label className={wrapperClass}>
      {label && <span className={css.label}>{label}</span>}
      <input className={inputClass} disabled={disabled} {...rest} />
      {errorText ? (
        <span className={css.errorRow}>
          <span className={css.errorText}>{errorText}</span>
          {errorDetails ? (
            <Tooltip content={errorDetails} placement="bottom" size="s">
              <span className={css.errorIcon} tabIndex={0}>
                <ErrorInfoIcon />
              </span>
            </Tooltip>
          ) : null}
        </span>
      ) : helperText ? (
        <span className={css.helperText}>{helperText}</span>
      ) : null}
    </label>
  );
};


