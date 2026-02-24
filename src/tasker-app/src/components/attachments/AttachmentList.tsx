import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { useAttachments } from '../../hooks/useAttachments';
import { EntityType } from '../../services/api/attachment.api';
import { AttachmentIcon } from '../icons/AttachmentIcon';
import { Loader } from '../ui/Loader';
import { AttachmentItem } from './AttachmentItem';
import css from './AttachmentList.module.css';
import { useToast } from '../../context/ToastContext';

export interface AttachmentListHandle {
    saveChanges: () => Promise<void>;
    hasPendingChanges: boolean;
}

interface AttachmentListProps {
    entityId: string;
    entityType: EntityType;
    isEditMode?: boolean;
    onUploadSuccess?: (attachmentId: string) => void;
    onDeleteSuccess?: (attachmentId: string) => void;
    onPendingChange?: (hasPending: boolean) => void; // New callback
}

export const AttachmentList = forwardRef<AttachmentListHandle, AttachmentListProps>(({
    entityId,
    entityType,
    isEditMode = true,
    onUploadSuccess,
    onDeleteSuccess,
    onPendingChange
}, ref) => {
    const { attachments, loading, error, upload, deleteAttachment, undoDelete, download, saveChanges, hasPendingChanges } = useAttachments(entityId, entityType, onPendingChange);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showError } = useToast();
    const [isUploading, setIsUploading] = useState(false);

    useImperativeHandle(ref, () => ({
        saveChanges,
        hasPendingChanges
    }));

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setIsUploading(true);
            try {
                // 20MB limit check
                if (file.size > 20 * 1024 * 1024) {
                    showError('Файл слишком большой. Максимальный размер 20МБ.');
                    return;
                }
                await upload(file);
                // No immediate callback call because it's pending
            } catch (e) {
                // Error handled in hook
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };

    const handleDelete = async (id: string) => {
        await deleteAttachment(id);
    };

    // Show loader only on initial fetch (when no attachments and loading, but not uploading)
    if (loading && !isUploading && attachments.length === 0) {
        return (
            <div className={css.container}>
                <div className={css.header}>
                    <div className={css.title}>Вложения</div>
                </div>
                <div className={css.empty}>
                    <Loader size="s" />
                </div>
            </div>
        );
    }

    return (
        <div className={css.container}>
            <div className={css.header}>
                <div className={css.title}>
                    Вложения
                    {hasPendingChanges && <span className={css.unsavedIndicator} title="Есть несохраненные изменения">*</span>}
                </div>
                {isEditMode && (
                    <button
                        className={css.uploadButton}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading || isUploading}
                    >
                        {isUploading ? <Loader size="xs" /> : <AttachmentIcon size={14} />}
                        <span>{isUploading ? 'Загрузка...' : 'Добавить'}</span>
                    </button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>

            {error && <div className={css.error}>{error}</div>}

            <div className={css.list}>
                {attachments.map((attachment) => (
                    <AttachmentItem
                        key={attachment.id}
                        attachment={attachment}
                        isEditMode={!!isEditMode}
                        isPending={attachment.isPending}
                        isPendingDelete={attachment.isPendingDelete}
                        onDelete={handleDelete}
                        onUndoDelete={undoDelete}
                        onDownload={download}
                    />
                ))}
                {!loading && attachments.length === 0 && (
                    <div className={css.empty}>Нет вложений</div>
                )}
            </div>
        </div>
    );
});
