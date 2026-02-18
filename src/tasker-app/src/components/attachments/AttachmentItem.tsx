import React from 'react';
import { Attachment } from '../../services/api/attachment.api';
import { DeleteIcon } from '../icons/DeleteIcon';
import { DownloadIcon } from '../icons/DownloadIcon';
import { ResetIcon } from '../icons/ResetIcon';
import { GlassIconButton } from '../ui/GlassIconButton';
import { formatDateTime } from '../../utils/date';
import { MetaInfoItem } from '../common/MetaInfoItem';
import css from './AttachmentItem.module.css';

interface AttachmentItemProps {
    attachment: Attachment;
    isEditMode: boolean;
    isPending?: boolean;
    isPendingDelete?: boolean;
    onDelete: (id: string) => void;
    onUndoDelete: (id: string) => void;
    onDownload: (id: string, fileName: string) => void;
}

export const AttachmentItem: React.FC<AttachmentItemProps> = ({
    attachment,
    isEditMode,
    isPending,
    isPendingDelete,
    onDelete,
    onUndoDelete,
    onDownload
}) => {
    return (
        <div
            className={`${css.item} ${isPending ? css.pending : ''} ${isPendingDelete ? css.pendingDelete : ''}`}
        >
            <div className={css.fileInfo}>
                <div className={css.fileName} title={attachment.originalFileName}>
                    {attachment.originalFileName}
                    {isPending && <span className={css.pendingLabel}> (не сохранено)</span>}
                    {isPendingDelete && <span className={css.pendingDeleteLabel}> (будет удалено)</span>}
                </div>

                <div className={css.fileMeta}>
                    <MetaInfoItem
                        label="Размер"
                        value={`${(attachment.size / 1024).toFixed(1)} KB`}
                    />
                    {attachment.createdAt && (
                        <MetaInfoItem
                            label="Добавлен"
                            value={formatDateTime(attachment.createdAt)}
                        />
                    )}
                </div>
            </div>
            <div className={css.actions}>
                {isPendingDelete ? (
                    <GlassIconButton
                        icon={<ResetIcon size={16} />}
                        onClick={() => onUndoDelete(attachment.id)}
                        title="Отменить удаление"
                        size="s"
                    />
                ) : (
                    <>
                        {!isPending && (
                            <GlassIconButton
                                icon={<DownloadIcon size={16} />}
                                onClick={() => onDownload(attachment.id, attachment.originalFileName)}
                                title="Скачать"
                                size="s"
                            />
                        )}
                        {isEditMode && (
                            <GlassIconButton
                                icon={<DeleteIcon size={16} />}
                                onClick={() => onDelete(attachment.id)}
                                title="Удалить"
                                size="s"
                                variant="danger"
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
