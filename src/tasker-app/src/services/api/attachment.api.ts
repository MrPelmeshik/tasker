import { apiFetch } from "./client";

export enum EntityType {
    AREA = 0,
    FOLDER = 1,
    TASK = 2,
    EVENT = 3,
}

export interface Attachment {
    id: string;
    originalFileName: string;
    storageFileName: string;
    contentType: string;
    size: number;
    entityId: string;
    entityType: EntityType;
    createdAt: string;
    ownerUserId: string;
}

export const attachmentApi = {
    upload: async (entityId: string, entityType: EntityType, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return apiFetch<Attachment>(
            `/attachments/${entityType}/${entityId}`,
            {
                method: "POST",
                body: formData,
            }
        );
    },

    getList: async (entityId: string, entityType: EntityType) => {
        return apiFetch<Attachment[]>(
            `/attachments/${entityType}/${entityId}`
        );
    },

    download: async (id: string, fileName: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/attachments/${id}/download`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error(`Error downloading file: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName; // backend might not send content-disposition correct for CORS, so we rely on fileName arg
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            console.error('Download error:', err);
            throw err;
        }
    },

    delete: async (id: string) => {
        return apiFetch<void>(`/attachments/${id}`, {
            method: "DELETE",
        });
    },
};
