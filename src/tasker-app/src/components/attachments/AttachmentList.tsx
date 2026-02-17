import React, { useRef, useState } from 'react';
import { useAttachments } from '../../hooks/useAttachments';
import { EntityType } from '../../services/api/attachment.api';
import { AttachmentIcon } from '../icons/AttachmentIcon';
import { DeleteIcon } from '../icons/DeleteIcon';
import { DownloadIcon } from '../icons/DownloadIcon';
import { GlassIconButton } from '../ui/GlassIconButton';
import { Loader } from '../ui/Loader';
import css from './AttachmentList.module.css';
import { useToast } from '../../context/ToastContext';

interface AttachmentListProps {
    entityId: string;
    entityType: EntityType;
    isEditMode?: boolean;
    onUploadSuccess?: (attachmentId: string) => void;
    onDeleteSuccess?: (attachmentId: string) => void;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
    entityId,
    entityType,
    isEditMode = true,
    onUploadSuccess,
    onDeleteSuccess
}) => {
    const { attachments, loading, error, upload, deleteAttachment, download } = useAttachments(entityId, entityType);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showError } = useToast();
    const [isUploading, setIsUploading] = useState(false);

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
                const newAttachment = await upload(file);
                if (newAttachment && onUploadSuccess) {
                    onUploadSuccess(newAttachment.id);
                }
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
        if (window.confirm('Удалить файл?')) {
            await deleteAttachment(id);
            if (onDeleteSuccess) {
                onDeleteSuccess(id);
            }
        }
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
                <div className={css.title}>Вложения</div>
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
                    <div key={attachment.id} className={css.item}>
                        <div className={css.fileInfo}>
                            <div className={css.fileName} title={attachment.originalFileName}>
                                {attachment.originalFileName}
                            </div>
                            <div className={css.fileSize}>
                                {(attachment.size / 1024).toFixed(1)} KB
                            </div>
                        </div>
                        <div className={css.actions}>
                            <GlassIconButton
                                icon={<DownloadIcon size={16} />}
                                onClick={() => download(attachment.id, attachment.originalFileName)}
                                title="Скачать"
                                size="s"
                            />
                            {isEditMode && (
                                <GlassIconButton
                                    icon={<DeleteIcon size={16} />}
                                    onClick={() => handleDelete(attachment.id)}
                                    title="Удалить"
                                    size="s"
                                    variant="danger"
                                />
                            )}
                        </div>
                    </div>
                ))}
                {!loading && attachments.length === 0 && (
                    <div className={css.empty}>Нет вложений</div>
                )}
            </div>
        </div>
    );
};
