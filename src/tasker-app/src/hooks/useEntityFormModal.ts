import { useState, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';

export interface UseEntityFormModalOptions<TForm extends object> {
  isOpen: boolean;
  entity: { id: string } | null;
  getInitialData: () => TForm;
  deps: unknown[];
  onClose: () => void;
  onSave: (data: TForm) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  validate?: (data: TForm) => boolean;
  getExtraUnsavedChanges?: (context: { originalData: TForm }) => boolean;
  onReturnToView?: () => void;
  onDiscard?: () => void;
}

/** Хук для CRUD-модалок: инициализация формы, отслеживание изменений, подтверждения. */
export function useEntityFormModal<TForm extends object>(
  options: UseEntityFormModalOptions<TForm>
) {
  const {
    isOpen,
    entity,
    getInitialData,
    deps,
    onClose,
    onSave,
    onDelete,
    validate = () => true,
    getExtraUnsavedChanges,
    onReturnToView,
    onDiscard,
  } = options;

  const { showError } = useToast();
  const [formData, setFormData] = useState<TForm>(getInitialData);
  const [originalData, setOriginalData] = useState<TForm>(getInitialData);
  const [fieldChanges, setFieldChanges] = useState<Record<string, boolean>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReturnToViewConfirm, setShowReturnToViewConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      const data = getInitialData();
      setFormData(data);
      setOriginalData(data);
      setFieldChanges({});
      setIsEditMode(!entity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps передаётся вызывающим кодом
  }, [isOpen, entity, ...deps]);

  const hasChanges = Object.values(fieldChanges).some(Boolean);
  const hasUnsavedChanges = hasChanges || (getExtraUnsavedChanges?.({ originalData }) ?? false);

  const handleFieldChange = (field: keyof TForm, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const hasChanged = value !== (originalData as Record<string, unknown>)[field as keyof TForm & string];
    setFieldChanges((prev) => ({ ...prev, [field as string]: hasChanged }));
  };

  const handleResetField = (field: keyof TForm) => {
    const originalValue = (originalData as Record<string, unknown>)[field as keyof TForm & string];
    setFormData((prev) => ({ ...prev, [field]: originalValue }));
    setFieldChanges((prev) => ({ ...prev, [field as string]: false }));
  };

  const handleSave = async () => {
    if (!validate(formData)) return;
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      showError(error);
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmModal(true);
    } else {
      onClose();
    }
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    await handleSave();
  };

  const handleConfirmDiscard = () => {
    setShowConfirmModal(false);
    onDiscard?.();
    onClose();
  };

  const handleConfirmCancel = () => {
    setShowConfirmModal(false);
  };

  const handleReturnToView = () => {
    if (hasUnsavedChanges) {
      setShowReturnToViewConfirm(true);
    } else {
      setIsEditMode(false);
    }
  };

  const handleConfirmReturnToView = () => {
    setShowReturnToViewConfirm(false);
    onReturnToView?.();
    setFormData(originalData);
    setFieldChanges({});
    setIsEditMode(false);
  };

  const handleDeleteRequest = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!entity?.id || !onDelete) return;
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setShowDeleteConfirm(false);
    setIsLoading(true);
    try {
      await onDelete(entity.id);
      onClose();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      showError(error);
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };

  const dismissReturnToViewConfirm = () => setShowReturnToViewConfirm(false);
  const dismissDeleteConfirm = () => setShowDeleteConfirm(false);

  return {
    formData,
    setFormData,
    originalData,
    fieldChanges,
    handleFieldChange,
    handleResetField,
    hasChanges,
    hasUnsavedChanges,
    showConfirmModal,
    showReturnToViewConfirm,
    showDeleteConfirm,
    handleClose,
    handleConfirmSave,
    handleConfirmDiscard,
    handleConfirmCancel,
    handleReturnToView,
    handleConfirmReturnToView,
    handleDeleteRequest,
    handleConfirmDelete,
    dismissReturnToViewConfirm,
    dismissDeleteConfirm,
    handleSave,
    isEditMode,
    setIsEditMode,
    isLoading,
  };
}
