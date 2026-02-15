import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
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
  /** Размер триггера и опций */
  size?: 's' | 'm' | 'l';
  disabled?: boolean;
  className?: string;
  /** Кастомный рендер опции в списке. Без него — label. */
  renderOption?: (option: GlassSelectOption, ctx: { size: 's' | 'm' | 'l'; isSelected: boolean }) => React.ReactNode;
  /** Рендер выбранного значения в триггере. По умолчанию — renderOption ?? label */
  renderValue?: (option: GlassSelectOption) => React.ReactNode;
  /** Показывать ли стрелку выпадающего списка */
  showArrow?: boolean;
  /** Вариант стиля (как у GlassButton) */
  variant?: 'default' | 'subtle';
  /** Класс для выпадающего списка */
  dropdownClassName?: string;
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
  showArrow = true,
  variant = 'default',
  dropdownClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;

      // Default: align left
      let left = rect.left;
      let width = rect.width;

      // Determine if we should align to right (if close to right edge) or custom width
      // If dropdownClassName is present, we might want to respect its width if possible, 
      // but here we just ensure it's positioned correctly.
      // For the Tree case, we want it aligned to the right of the button if it's too wide
      // or simply rely on CSS handling the width if we pass just top/left.

      // Let's position it below the button
      const top = rect.bottom + window.scrollY + 4; // 4px gap

      const style: React.CSSProperties = {
        position: 'absolute',
        top,
        left,
        minWidth: width,
        width: 'auto', // Allow it to be wider
        zIndex: 9999,
      };

      // Simple heuristic: if the button is on the right half of the screen, align dropdown to right edge of button
      if (rect.left > screenWidth / 2) {
        // Right align
        delete style.left;
        style.right = screenWidth - rect.right;
        style.left = 'auto';
      }

      setDropdownStyle(style);
    }
  }, [isOpen]);

  const selectedOption = options.find(option => option.value === value);

  const wrapperClass = [css.wrapper, fullWidth ? css.fullWidth : '', className]
    .filter(Boolean)
    .join(' ');

  const buttonClass = [css.input, css[size], css[variant], errorText ? css.error : '', disabled ? css.disabled : '', css.customSelect]
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

  // Calculate dropdown position
  useLayoutEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'absolute',
        top: buttonRect.bottom + window.scrollY,
        left: buttonRect.left + window.scrollX,
        width: buttonRect.width,
        zIndex: 1000, // Ensure it's above other content
      });
    }
  }, [isOpen]);

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
          {showArrow && (
            <span className={css.selectArrow} aria-hidden="true">
              ▼
            </span>
          )}
        </button>

        {isOpen && createPortal(
          <ul
            ref={listRef}
            className={[css.customSelectList, css[size], 'scrollbar-compact', dropdownClassName].filter(Boolean).join(' ')}
            role="listbox"
            aria-labelledby={label ? `${label}-label` : undefined}
            style={dropdownStyle}
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
          </ul>,
          document.body
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
