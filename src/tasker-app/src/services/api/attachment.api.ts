import { apiFetch, ensureAccessTokenFresh, refreshAccessToken } from "./client";
import { getApiBase } from "../../config/api";
import { getStoredTokens } from "../storage/token";
import { logger } from "../../utils/logger";

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
            await ensureAccessTokenFresh();

            const apiBase = getApiBase();
            const url = `${apiBase}/attachments/${id}/download`;

            const buildHeaders = (): HeadersInit => {
                const h: HeadersInit = {};
                const token = getStoredTokens()?.accessToken;
                if (token) {
                    h['Authorization'] = `Bearer ${token}`;
                }
                return h;
            };

            let response = await fetch(url, {
                method: 'GET',
                headers: buildHeaders(),
                credentials: 'include',
            });

            // Retry once on 401 after refreshing the token
            if (response.status === 401) {
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    response = await fetch(url, {
                        method: 'GET',
                        headers: buildHeaders(),
                        credentials: 'include',
                    });
                }
            }

            if (!response.ok) {
                const ct = response.headers.get('content-type');
                if (ct && ct.includes('application/json')) {
                    const errorJson = await response.json();
                    throw new Error(errorJson.message || `Error downloading file: ${response.statusText}`);
                }
                const errorText = await response.text();
                throw new Error(errorText || `Error downloading file: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error('Server returned HTML instead of file. Check API configuration.');
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        } catch (err: unknown) {
            logger.error('Download error:', err);
            throw err;
        }
    },

    delete: async (id: string) => {
        return apiFetch<void>(`/attachments/${id}`, {
            method: "DELETE",
        });
    },
};
