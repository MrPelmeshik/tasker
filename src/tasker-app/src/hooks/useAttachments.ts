import { useState, useCallback, useEffect, useMemo } from 'react';
import { attachmentApi, Attachment, EntityType } from '../services/api/attachment.api';

export interface PendingAttachment {
    file: File;
    tempId: string;
}

export const useAttachments = (entityId: string, entityType: EntityType, onPendingChange?: (hasPending: boolean) => void) => {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [pendingUploads, setPendingUploads] = useState<PendingAttachment[]>([]);
    const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Notify parent whenever pending state changes
    useEffect(() => {
        const hasPending = pendingUploads.length > 0 || pendingDeletes.size > 0;
        onPendingChange?.(hasPending);
    }, [pendingUploads.length, pendingDeletes.size, onPendingChange]);

    const fetchAttachments = useCallback(async () => {
        if (!entityId) return;
        try {
            setLoading(true);
            const data = await attachmentApi.getList(entityId, entityType);
            setAttachments(data);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error fetching attachments');
        } finally {
            setLoading(false);
        }
    }, [entityId, entityType]);

    const upload = useCallback(async (file: File) => {
        // Transactional: Don't upload yet, just add to pending
        const tempId = `temp-${Date.now()}-${file.name}`;
        setPendingUploads(prev => [...prev, { file, tempId }]);
        return { id: tempId } as Attachment; // Return mock for UI
    }, []);

    const deleteAttachment = useCallback(async (id: string) => {
        if (id.startsWith('temp-')) {
            // If it's a pending upload, just remove it from pending list
            setPendingUploads(prev => prev.filter(u => u.tempId !== id));
        } else {
            // Transactional: Mark for deletion
            setPendingDeletes(prev => {
                const newSet = new Set(prev);
                newSet.add(id);
                return newSet;
            });
        }
    }, []);

    const saveChanges = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Process Deletes
            if (pendingDeletes.size > 0) {
                await Promise.all(Array.from(pendingDeletes).map(id => attachmentApi.delete(id)));
            }

            // 2. Process Uploads
            if (pendingUploads.length > 0) {
                await Promise.all(pendingUploads.map(p => attachmentApi.upload(entityId, entityType, p.file)));
            }

            // Reset pending state and refetch
            setPendingDeletes(new Set());
            setPendingUploads([]);
            await fetchAttachments();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error saving changes');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [entityId, entityType, pendingDeletes, pendingUploads, fetchAttachments]);

    const cancelChanges = useCallback(() => {
        setPendingDeletes(new Set());
        setPendingUploads([]);
    }, []);

    const download = useCallback(async (id: string, fileName: string) => {
        try {
            setError(null);
            await attachmentApi.download(id, fileName);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error downloading file');
        }
    }, []);

    useEffect(() => {
        if (entityId) {
            fetchAttachments();
        }
    }, [entityId, fetchAttachments]);

    const undoDelete = useCallback((id: string) => {
        setPendingDeletes(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    }, []);

    // Computed list for UI: existing (with delete markers) + pending uploads
    const displayedAttachments = useMemo(() => {
        const existing = attachments.map(a => ({
            ...a,
            isPendingDelete: pendingDeletes.has(a.id),
        }));
        const pending = pendingUploads.map(p => ({
            id: p.tempId,
            originalFileName: p.file.name,
            storageFileName: '',
            contentType: p.file.type,
            size: p.file.size,
            entityId,
            entityType,
            createdAt: new Date().toISOString(),
            ownerUserId: '',
            isPending: true,
            isPendingDelete: false,
        } as Attachment & { isPending?: boolean; isPendingDelete: boolean }));

        return [...existing, ...pending];
    }, [attachments, pendingDeletes, pendingUploads, entityId, entityType]);

    return {
        attachments: displayedAttachments,
        loading,
        error,
        upload,
        deleteAttachment,
        undoDelete,
        download,
        saveChanges,
        cancelChanges,
        hasPendingChanges: pendingDeletes.size > 0 || pendingUploads.length > 0,
        refetch: fetchAttachments,
    };
};
