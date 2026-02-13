import React, { useState, useRef, useEffect } from 'react';
import css from '../../styles/glass-input.module.css';

/** Опция для выбора в GlassSelect */
export type GlassSelectOption = { value: string; label: string };

type GlassSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: GlassSelectOption[];
  placeholder?: string;
  label?: string;
  helperText?: string;
  errorText?: string;
  fullWidth?: boolean;
  /** Размер: влияет на padding триггера, опций и передаётся в renderOption */
  size?: 's' | 'm' | 'l';
  disabled?: boolean;
  className?: string;
  /** Кастомный рендер опции в списке. Без него — label. */
  renderOption?: (option: GlassSelectOption, ctx: { size: 's' | 'm' | 'l'; isSelected: boolean }) => React.ReactNode;
  /** Рендер выбранного значения в триггере. По умолчанию — renderOption ?? label */
  renderValue?: (option: GlassSelectOption) => React.ReactNode;
};

export const GlassSelect: React.FC<GlassSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Выберите опцию',
  label,
  helperText,
  errorText,
  fullWidth,
  size = 'm',
  disabled = false,
  className,
  renderOption,
  renderValue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find(option => option.value === value);

  const wrapperClass = [css.wrapper, fullWidth ? css.fullWidth : '', className]
    .filter(Boolean)
    .join(' ');
  
  const buttonClass = [css.input, css[size], errorText ? css.error : '', disabled ? css.disabled : '', css.customSelect]
    .filter(Boolean)
    .join(' ');

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setFocusedIndex(-1);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          handleSelect(options[focusedIndex].value);
        } else {
          handleToggle();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        setFocusedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Scroll focused option into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  return (
    <div className={wrapperClass} ref={containerRef}>
      {label && <span className={css.label}>{label}</span>}
      <div className={css.customSelectContainer}>
        <button
          ref={buttonRef}
          type="button"
          className={buttonClass}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? `${label}-label` : undefined}
        >
          <span className={css.selectValue}>
            {selectedOption
              ? (renderValue?.(selectedOption) ?? renderOption?.(selectedOption, { size, isSelected: true }) ?? selectedOption.label)
              : placeholder}
          </span>
          <span className={css.selectArrow} aria-hidden="true">
            ▼
          </span>
        </button>
        
        {isOpen && (
          <ul
            ref={listRef}
            className={[css.customSelectList, css[size]].filter(Boolean).join(' ')}
            role="listbox"
            aria-labelledby={label ? `${label}-label` : undefined}
          >
            {options.map((option, index) => {
              const isSelected = value === option.value;
              const content = renderOption
                ? renderOption(option, { size, isSelected })
                : option.label;
              return (
                <li
                  key={option.value}
                  className={[
                    css.customSelectOption,
                    isSelected ? css.selected : '',
                    index === focusedIndex ? css.focused : ''
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  onMouseLeave={() => setFocusedIndex(-1)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className={css.customSelectOptionContent}>{content}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      {errorText ? (
        <span className={css.errorRow}>
          <span className={css.errorText}>{errorText}</span>
        </span>
      ) : helperText ? (
        <span className={css.helperText}>{helperText}</span>
      ) : null}
    </div>
  );
};
