// Типы для Events API (активности)

export type EventType = number; // 0=UNKNOWN, 1=CREATE, 2=UPDATE, 3=DELETE, 4=NOTE, 5=ACTIVITY

export interface EventCreateRequest {
  entityId: string;
  title: string;
  description?: string;
  eventType: EventType;
  /** Дата и время события/активности (ISO YYYY-MM-DD или полный ISO с временем) */
  eventDate: string;
}

/** Запрос на частичное обновление события (все поля опциональны) */
export interface EventUpdateRequest {
  title?: string;
  description?: string;
  eventType?: EventType;
  eventDate?: string;
}

export interface EventCreateResponse {
  id: string;
}

/** Сообщение события в формате JSON (могут быть old/new, title/description, text и т.д.) */
export type EventMessage = Record<string, unknown> | null;

export interface EventResponse {
  id: string;
  title: string;
  message?: EventMessage;
  eventType: string;
  ownerUserId: string;
  ownerUserName?: string;
  createdAt: Date;
  /** Дата события/активности */
  eventDate: Date;
  updatedAt: Date;
  isActive: boolean;
  deactivatedAt?: Date;
}
