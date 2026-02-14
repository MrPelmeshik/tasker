import React from 'react';
import css from './loader.module.css';

export interface LoaderProps {
  /** Размер спиннера */
  size?: 'xs' | 's' | 'm' | 'l';
  /** Подпись для скринридеров (доступность) */
  ariaLabel?: string;
  /** Центрировать спиннер во flex-контейнере */
  centered?: boolean;
  className?: string;
}

/**
 * Анимированный индикатор загрузки.
 * Только спиннер, без текста. Поддерживает разные размеры и prefers-reduced-motion.
 */
export const Loader: React.FC<LoaderProps> = ({
  size = 'm',
  ariaLabel,
  centered = false,
  className,
}) => {
  const sizeClass = {
    xs: css.spinnerXs,
    s: css.spinnerS,
    m: css.spinnerM,
    l: css.spinnerL,
  }[size];

  const spinner = (
    <div
      className={`${css.spinner} ${sizeClass}`}
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
    />
  );

  if (centered) {
    return (
      <div className={`${css.block} ${className ?? ''}`.trim() || undefined}>
        {spinner}
      </div>
    );
  }

  return spinner;
};
