/**
 * Real-time сервис на базе SignalR для получения push-уведомлений об изменениях сущностей
 */

import * as signalR from '@microsoft/signalr';
import { ensureAccessTokenFresh } from '../api/client';
import { getStoredTokens } from '../storage/token';
import { fetchAreaShortCard } from '../api';

/** Payload события EntityChanged */
export interface EntityChangedPayload {
  entityType: string;
  entityId: string;
  areaId: string;
  folderId?: string | null;
  eventType: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Проверка валидности payload EntityChanged */
function isValidEntityChangedPayload(payload: unknown): payload is EntityChangedPayload {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  return (
    typeof p.entityType === 'string' &&
    typeof p.entityId === 'string' &&
    typeof p.areaId === 'string' &&
    typeof p.eventType === 'string' &&
    (p.folderId === null ||
      p.folderId === undefined ||
      (typeof p.folderId === 'string' && (p.folderId === '' || UUID_REGEX.test(p.folderId)))) &&
    UUID_REGEX.test(p.entityId) &&
    UUID_REGEX.test(p.areaId)
  );
}

type EntityChangedCallback = (payload: EntityChangedPayload) => void;
type ReconnectedCallback = () => void;

let connection: signalR.HubConnection | null = null;
let entityChangedCallbacks: Set<EntityChangedCallback> = new Set();
let reconnectedCallbacks: Set<ReconnectedCallback> = new Set();
let currentAreaIds: string[] = [];
let connectPromise: Promise<void> | null = null;
let isRealtimeUnavailable = false;
type RealtimeStatusCallback = (unavailable: boolean) => void;
const statusCallbacks = new Set<RealtimeStatusCallback>();

/** Получить URL Hub (без /api) */
function getHubUrl(): string {
  const base =
    process.env.REACT_APP_API_BASE ||
    (() => {
      if (process.env.NODE_ENV === 'production') {
        console.warn('REACT_APP_API_BASE не задан, используется localhost — проверьте сборку');
      }
      return 'http://localhost:8080';
    })();
  const withoutApi = base.replace(/\/api\/?$/, '');
  return `${withoutApi}/hubs/tasker`;
}

/** Вызвать JoinAreas с текущим списком областей */
async function joinAreas(): Promise<void> {
  if (!connection || connection.state !== signalR.HubConnectionState.Connected) return;
  try {
    const areaIds = currentAreaIds.length > 0 ? currentAreaIds : await fetchAreaIds();
    if (areaIds.length > 0) {
      await connection.invoke('JoinAreas', areaIds);
    }
  } catch (err) {
    console.warn('Ошибка JoinAreas:', err);
  }
}

/** Получить список areaIds через API */
async function fetchAreaIds(): Promise<string[]> {
  try {
    const cards = await fetchAreaShortCard();
    return cards.map((c) => c.id);
  } catch {
    return [];
  }
}

/** Обновить список областей и вызвать JoinAreas */
export async function updateJoinAreas(areaIds?: string[]): Promise<void> {
  if (areaIds) {
    currentAreaIds = areaIds;
  } else {
    currentAreaIds = await fetchAreaIds();
  }
  await joinAreas();
}

/** Подписаться на EntityChanged */
export function onEntityChanged(callback: EntityChangedCallback): () => void {
  entityChangedCallbacks.add(callback);
  return () => entityChangedCallbacks.delete(callback);
}

/** Подписаться на reconnected для глобального refresh */
export function onReconnected(callback: ReconnectedCallback): () => void {
  reconnectedCallbacks.add(callback);
  return () => reconnectedCallbacks.delete(callback);
}

/** Подписаться на изменение статуса (unavailable) */
export function onRealtimeStatusChange(callback: RealtimeStatusCallback): () => void {
  callback(isRealtimeUnavailable);
  statusCallbacks.add(callback);
  return () => statusCallbacks.delete(callback);
}

function notifyStatusChange(unavailable: boolean): void {
  isRealtimeUnavailable = unavailable;
  statusCallbacks.forEach((cb) => cb(unavailable));
}

/** Обновить JoinAreas при create/delete области (из EntityChanged) */
function handleAreaCreateOrDelete(): void {
  void updateJoinAreas();
}

/** Запустить соединение (только при isAuth). Параллельные вызовы ждут один и тот же Promise. */
export async function startRealtime(): Promise<void> {
  if (connection?.state === signalR.HubConnectionState.Connected) return;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    const ready = await ensureAccessTokenFresh();
    if (!ready) return;

    const token = getStoredTokens()?.accessToken;
    if (!token) return;

    isRealtimeUnavailable = false;

    try {
      connection = new signalR.HubConnectionBuilder()
        .withUrl(getHubUrl(), {
          accessTokenFactory: async () => {
            await ensureAccessTokenFresh();
            return getStoredTokens()?.accessToken ?? '';
          },
        })
        .withAutomaticReconnect()
        .build();

      connection.on('EntityChanged', (payload: unknown) => {
        if (!isValidEntityChangedPayload(payload)) {
          console.warn('EntityChanged: некорректный payload', payload);
          return;
        }
      // Каждый callback в отдельном try/catch — ошибка в одном не прерывает остальные
      entityChangedCallbacks.forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {
          console.error('Ошибка в callback EntityChanged:', e);
        }
      });
        if (
          payload.entityType === 'AREA' &&
          (payload.eventType === 'Create' || payload.eventType === 'Delete')
        ) {
          handleAreaCreateOrDelete();
        }
      });

      connection.onreconnected = async () => {
        notifyStatusChange(false);
        await joinAreas();
        reconnectedCallbacks.forEach((cb) => {
          try {
            cb();
          } catch (e) {
            console.error('Ошибка в callback reconnected:', e);
          }
        });
      };

      connection.onreconnecting = () => {
        // При необходимости показать индикатор "Переподключение..."
      };

      connection.onclose = () => {
        notifyStatusChange(true);
      };

      await connection.start();
      await updateJoinAreas();
    } catch (err) {
      console.warn('SignalR: не удалось подключиться', err);
      notifyStatusChange(true);
    }
  })();

  try {
    await connectPromise;
  } finally {
    connectPromise = null;
  }
}

/** Остановить соединение */
export async function stopRealtime(): Promise<void> {
  if (connection) {
    try {
      await connection.stop();
    } catch {}
    connection = null;
  }
  currentAreaIds = [];
}

/** Доступность real-time (при блокировке WebSocket) */
export function isRealtimeUnavailableFlag(): boolean {
  return isRealtimeUnavailable;
}
