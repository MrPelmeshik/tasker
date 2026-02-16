import React, { useEffect, useRef, useState } from 'react';
import css from '../../styles/color-picker.module.css';

export interface ColorPickerProps {
  /** Текущий hex (или undefined) */
  value?: string;
  /** Вызов при выборе цвета */
  onChange: (hex: string) => void;
  /** Отключить взаимодействие */
  disabled?: boolean;
  /** Подпись поля */
  label?: string;
  /** Обязательное поле (звёздочка) */
  required?: boolean;
  /** Показывать поле ввода hex */
  showHexInput?: boolean;
}

const HEX_REGEX = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

function normalizeHex(hex: string): string {
  const m = hex.match(HEX_REGEX);
  if (!m) return hex;
  const s = m[1];
  if (s.length === 3) {
    return '#' + s.split('').map((c) => c + c).join('');
  }
  return '#' + s;
}

/**
 * Выбор одного цвета: свап + нативный color picker, опционально ввод hex.
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  disabled,
  label,
  required,
  showHexInput = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hexInput, setHexInput] = useState(value ?? '');

  useEffect(() => {
    setHexInput(value ?? '');
  }, [value]);

  const handleSwatchClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    if (hex) {
      const normalized = normalizeHex(hex);
      onChange(normalized);
      setHexInput(normalized);
    }
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setHexInput(raw);
    const normalized = normalizeHex(raw.startsWith('#') ? raw : '#' + raw);
    if (normalized && normalized.length === 7) {
      onChange(normalized);
    }
  };

  const handleHexBlur = () => {
    if (value) setHexInput(value);
    else setHexInput('');
  };

  const displayHex = value ?? hexInput;

  return (
    <div className={css.root}>
      {label != null && (
        <span className={css.label}>
          {label}
          {required && <span className={css.required}> *</span>}
        </span>
      )}
      <div className={css.row}>
        <button
          type="button"
          className={css.swatch}
          style={{ backgroundColor: value || 'transparent' }}
          onClick={handleSwatchClick}
          disabled={disabled}
          title={value || 'Выберите цвет'}
          aria-label={value ? value : 'Выбрать цвет'}
        />
        {showHexInput && (
          <input
            type="text"
            className={css.hexInput}
            value={displayHex}
            onChange={handleHexChange}
            onBlur={handleHexBlur}
            placeholder="#000000"
            disabled={disabled}
            maxLength={9}
            aria-label="Код цвета"
          />
        )}
        <input
          ref={inputRef}
          type="color"
          className={css.hiddenInput}
          value={value?.slice(0, 7) || '#000000'}
          onChange={handlePickerChange}
          tabIndex={-1}
          aria-hidden
        />
      </div>
    </div>
  );
}
