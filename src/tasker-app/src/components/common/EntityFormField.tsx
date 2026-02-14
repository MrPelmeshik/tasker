import React from 'react';
import { ModalResetFieldButton } from '../ui';
import formCss from '../../styles/modal-form.module.css';

export interface EntityFormFieldProps {
  label: string;
  hasChange?: boolean;
  onReset?: () => void;
  isViewMode: boolean;
  isLoading?: boolean;
  viewContent: React.ReactNode;
  editContent: React.ReactNode;
}

export const EntityFormField: React.FC<EntityFormFieldProps> = ({
  label,
  hasChange,
  onReset,
  isViewMode,
  viewContent,
  editContent,
}) => (
  <div className={formCss.fieldGroup}>
    <div className={formCss.fieldHeader}>
      <label className={formCss.fieldLabel}>{label}</label>
      {!isViewMode && hasChange && onReset && (
        <ModalResetFieldButton onClick={onReset} className={formCss.resetButton} />
      )}
    </div>
    <div className={formCss.fieldContainer}>
      {isViewMode ? viewContent : editContent}
    </div>
  </div>
);
