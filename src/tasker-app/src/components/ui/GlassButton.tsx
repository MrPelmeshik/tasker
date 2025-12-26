import React, { useRef, useLayoutEffect, useCallback, useState } from 'react';
import css from '../../styles/glass-button.module.css';

type Size = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl';
type Option = { key: string; label: React.ReactNode };

type GlassButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'danger' | 'success' | 'warning' | 'subtle';
  size?: Size;
  fullWidth?: boolean;
  disabled?: boolean;
  // Toggle group props
  toggleGroup?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  options?: Option[];
  equalWidth?: boolean;
};

export const GlassButton: React.FC<GlassButtonProps> = ({ 
  variant = 'default', 
  size = 'm', 
  fullWidth, 
  disabled = false,
  className, 
  children, 
  toggleGroup = false,
  value,
  onChange,
  options,
  equalWidth = false,
  ...rest 
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({ width: 0, transform: 'translateX(0px)' });

  const updateIndicator = useCallback(() => {
    if (!toggleGroup || !value) return;
    const btn = btnRefs.current[value];
    const container = containerRef.current;
    if (!btn || !container) return;
    const btnRect = btn.getBoundingClientRect();
    const rootRect = container.getBoundingClientRect();
    const left = btnRect.left - rootRect.left;
    setIndicatorStyle({ width: btnRect.width, transform: `translateX(${left}px)` });
  }, [value, toggleGroup]);

  useLayoutEffect(() => {
    if (toggleGroup) {
      updateIndicator();
    }
  }, [updateIndicator, options, children, size, fullWidth, equalWidth]);

  React.useEffect(() => {
    if (toggleGroup) {
      const onResize = () => updateIndicator();
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
  }, [updateIndicator, toggleGroup]);

  const handleClick = (key: string) => {
    if (disabled) return;
    if (toggleGroup && onChange && key !== value) {
      onChange(key);
    }
  };

  const renderOption = (key: string, label: React.ReactNode) => {
    const selected = key === value;
    const btnClass = [css.btn, css[variant], css[size], selected ? css.selected : '', disabled ? css.disabled : '', className]
      .filter(Boolean)
      .join(' ');
    return (
      <button
        key={key}
        type="button"
        className={btnClass}
        onClick={() => handleClick(key)}
        disabled={disabled}
        ref={(el) => { btnRefs.current[key] = el; }}
        {...rest}
      >
        <span className={css.inner}>{label}</span>
      </button>
    );
  };

  // Toggle group mode
  if (toggleGroup && options && options.length > 0) {
    const rootClasses = [
      css.toggleRoot, 
      css[size], 
      fullWidth ? css.fullWidth : '', 
      equalWidth ? css.equal : '', 
      className
    ].filter(Boolean).join(' ');

    return (
      <div className={rootClasses} ref={containerRef}>
        <div className={css.indicator} style={indicatorStyle} />
        {options.map(o => renderOption(o.key, o.label))}
      </div>
    );
  }

  // Children mode for toggle group
  if (toggleGroup && children) {
    const childOptions: Option[] = [];
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;
      const propsAny = (child as React.ReactElement<any>).props as any;
      const candidateKey = propsAny?.value ?? (child.key != null ? String(child.key) : undefined);
      if (!candidateKey) return;
      childOptions.push({ key: String(candidateKey), label: propsAny?.children });
    });

    if (childOptions.length > 0) {
      const rootClasses = [
        css.toggleRoot, 
        css[size], 
        fullWidth ? css.fullWidth : '', 
        equalWidth ? css.equal : '', 
        className
      ].filter(Boolean).join(' ');

      return (
        <div className={rootClasses} ref={containerRef}>
          <div className={css.indicator} style={indicatorStyle} />
          {childOptions.map(o => renderOption(o.key, o.label))}
        </div>
      );
    }
  }

  // Regular button mode
  const classes = [css.btn, css[variant], css[size], fullWidth ? css.fullWidth : '', disabled ? css.disabled : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button className={classes} disabled={disabled} {...rest}>
      <span className={css.inner}>{children}</span>
    </button>
  );
};


