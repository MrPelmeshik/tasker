import { useState, useCallback, useEffect } from 'react';
import { attachmentApi, Attachment, EntityType } from '../services/api/attachment.api';

export const useAttachments = (entityId: string, entityType: EntityType) => {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAttachments = useCallback(async () => {
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
        try {
            setLoading(true);
            const newAttachment = await attachmentApi.upload(entityId, entityType, file);
            await fetchAttachments();
            return newAttachment;
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error uploading file');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [entityId, entityType, fetchAttachments]);

    const deleteAttachment = useCallback(async (id: string) => {
        try {
            setLoading(true);
            await attachmentApi.delete(id);
            await fetchAttachments();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error deleting file');
        } finally {
            setLoading(false);
        }
    }, [fetchAttachments]);

    const download = useCallback(async (id: string, fileName: string) => {
        try {
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

    return {
        attachments,
        loading,
        error,
        upload,
        deleteAttachment,
        download,
        refetch: fetchAttachments,
    };
};
