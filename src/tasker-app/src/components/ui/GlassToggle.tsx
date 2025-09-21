import React from 'react';
import css from './glass-toggle.module.css';

type Size = 's' | 'm' | 'l';

type Option = { key: string; label: React.ReactNode };

type GlassToggleProps = {
  value: string;
  onChange: (value: string) => void;
  options?: Option[];
  size?: Size;
  className?: string;
  children?: React.ReactNode; // alternative to options
  fullWidth?: boolean;
  equalWidth?: boolean;
};

export const GlassToggle: React.FC<GlassToggleProps> = ({
  value,
  onChange,
  options,
  size = 'm',
  className,
  children,
  fullWidth,
  equalWidth,
}) => {
  const classes = [css.root, css[size], fullWidth ? css.fullWidth : '', equalWidth ? css.equal : '', className]
    .filter(Boolean)
    .join(' ');

  const handleClick = (key: string) => {
    if (key !== value) onChange(key);
  };

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const btnRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = React.useState<React.CSSProperties>({ width: 0, transform: 'translateX(0px)' });

  const updateIndicator = React.useCallback(() => {
    const btn = btnRefs.current[value];
    const container = containerRef.current;
    if (!btn || !container) return;
    const btnRect = btn.getBoundingClientRect();
    const rootRect = container.getBoundingClientRect();
    const left = btnRect.left - rootRect.left;
    setIndicatorStyle({ width: btnRect.width, transform: `translateX(${left}px)` });
  }, [value]);

  React.useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, options, children, size, fullWidth]);

  React.useEffect(() => {
    const onResize = () => updateIndicator();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateIndicator]);

  const renderOption = (key: string, label: React.ReactNode) => {
    const selected = key === value;
    const btnClass = [css.btn, selected ? css.selected : ''].filter(Boolean).join(' ');
    return (
      <button
        key={key}
        type="button"
        className={btnClass}
        onClick={() => handleClick(key)}
        ref={(el) => { btnRefs.current[key] = el; }}
      >
        <span className={css.inner}>{label}</span>
      </button>
    );
  };

  if (options && options.length > 0) {
    return (
      <div className={classes} ref={containerRef}>
        <div className={css.indicator} style={indicatorStyle} />
        {options.map(o => renderOption(o.key, o.label))}
      </div>
    );
  }

  // children mode: accept elements with a 'value' prop or use React key; label from children
  const childOptions: Option[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const propsAny = (child as React.ReactElement<any>).props as any;
    const candidateKey = propsAny?.value ?? (child.key != null ? String(child.key) : undefined);
    if (!candidateKey) return;
    childOptions.push({ key: String(candidateKey), label: propsAny?.children });
  });
  return (
    <div className={classes} ref={containerRef}>
      <div className={css.indicator} style={indicatorStyle} />
      {childOptions.map(o => renderOption(o.key, o.label))}
    </div>
  );
};


